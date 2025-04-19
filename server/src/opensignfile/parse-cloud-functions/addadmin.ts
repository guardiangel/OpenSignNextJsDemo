import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import Parse from 'parse/node';

export function defineAddadmin(configService: ConfigService) {
  Parse.Cloud.define('addadmin', async (request) => {
    const userDetails = request.params.userDetails;
    const user = await saveUser(userDetails, configService);

    try {
      const extQuery = new Parse.Query('contracts_Users');
      extQuery.equalTo('UserId', {
        __type: 'Pointer',
        className: '_User',
        objectId: user.id,
      });
      const extUser = await extQuery.first({ useMasterKey: true });
      if (extUser) {
        return { message: 'User already exist' };
      } else {
        const partnerQuery = new Parse.Object('partners_Tenant');
        partnerQuery.set('UserId', {
          __type: 'Pointer',
          className: '_User',
          objectId: user.id,
        });

        if (userDetails?.phone) {
          partnerQuery.set('ContactNumber', userDetails.phone);
        }
        partnerQuery.set('TenantName', userDetails.company);
        partnerQuery.set('EmailAddress', userDetails.email);
        partnerQuery.set('IsActive', true);
        partnerQuery.set('CreatedBy', {
          __type: 'Pointer',
          className: '_User',
          objectId: user.id,
        });
        if (userDetails && userDetails.pincode) {
          partnerQuery.set('PinCode', userDetails.pincode);
        }
        if (userDetails && userDetails.country) {
          partnerQuery.set('Country', userDetails.country);
        }
        if (userDetails && userDetails.state) {
          partnerQuery.set('State', userDetails.state);
        }
        if (userDetails && userDetails.city) {
          partnerQuery.set('City', userDetails.city);
        }
        if (userDetails && userDetails.address) {
          partnerQuery.set('Address', userDetails.address);
        }
        const tenantRes = await partnerQuery.save(null, {
          useMasterKey: true,
        });
        const newObj = new Parse.Object('contracts_Users');
        newObj.set('UserId', {
          __type: 'Pointer',
          className: '_User',
          objectId: user.id,
        });
        newObj.set('UserRole', userDetails.role);
        newObj.set('Email', userDetails.email);
        newObj.set('Name', userDetails.name);
        newObj.set('TourStatus', [{ loginTour: true }]);
        if (userDetails?.phone) {
          newObj.set('Phone', userDetails?.phone);
        }
        newObj.set('TenantId', {
          __type: 'Pointer',
          className: 'partners_Tenant',
          objectId: tenantRes.id,
        });
        if (userDetails && userDetails.company) {
          newObj.set('Company', userDetails.company);
        }
        if (userDetails && userDetails.jobTitle) {
          newObj.set('JobTitle', userDetails.jobTitle);
        }
        newObj.set('TourStatus', [{ loginTour: true }]);
        const extRes = await newObj.save(null, { useMasterKey: true });
        // if (subscription) {
        const extUser = {
          objectId: extRes.id,
          Name: userDetails.name,
          Email: userDetails.email,
          Phone: userDetails?.phone ? userDetails.phone : '',
          TenantId: { objectId: tenantRes.id },
          UserId: { objectId: user.id },
          UserRole: userDetails.role,
          Company: userDetails.company,
          JobTitle: userDetails.jobTitle,
          TourStatus: [{ loginTour: true }],
        };
        await addTeamAndOrg(extUser);
        // await saveSubscription(extRes.id, user.id, tenantRes.id, subscription);
        // }

        return { message: 'User sign up', sessionToken: user.sessionToken };
      }
    } catch (err:any) {
      console.log('Err ', err);
    }
  });
}

async function saveUser(userDetails, configService: ConfigService) {
  try {
    const userQuery = new Parse.Query(Parse.User);
    userQuery.equalTo('username', userDetails.email);
    const userRes = await userQuery.first({ useMasterKey: true });

    if (userRes) {
      //loginAs method is defined in Parse library implicitly. this method will invoke database directly via network.
      //Not figure out why in this way. GuiquanSun20250313
      const url = configService.get<string>('OpenSignServerURL') + '/loginAs';

      const axiosRes = await axios({
        method: 'POST',
        url: url,
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
          'X-Parse-Application-Id': configService.get<string>(
            'XParseApplicationId',
          ),
          'X-Parse-Master-Key': configService.get<string>('XParseMasterKey'),
        },
        params: {
          userId: userRes.id,
        },
      });

      const login = await axiosRes.data;
      return { id: login.objectId, sessionToken: login.sessionToken };
    } else {
      const user = new Parse.User();
      user.set('username', userDetails.email);
      user.set('password', userDetails.password);
      user.set('email', userDetails.email);
      if (userDetails?.phone) {
        user.set('phone', userDetails.phone);
      }
      user.set('name', userDetails.name);
      const res = await user.signUp();
      return { id: res.id, sessionToken: res.getSessionToken() };
    }
  } catch (err:any) {
    console.log('saveUser Err=====', err.message);
    throw err;
  }
}

async function addTeamAndOrg(extUser) {
  try {
    const orgCls = new Parse.Object('contracts_Organizations');
    orgCls.set('Name', extUser.Company);
    orgCls.set('IsActive', true);
    orgCls.set('ExtUserId', {
      __type: 'Pointer',
      className: 'contracts_Users',
      objectId: extUser?.objectId,
    });
    orgCls.set('CreatedBy', {
      __type: 'Pointer',
      className: '_User',
      objectId: extUser?.UserId?.objectId,
    });
    orgCls.set('TenantId', {
      __type: 'Pointer',
      className: 'partners_Tenant',
      objectId: extUser?.TenantId?.objectId,
    });

    const orgRes = await orgCls.save(null, { useMasterKey: true });
    const teamCls = new Parse.Object('contracts_Teams');
    teamCls.set('Name', 'All Users');
    teamCls.set('OrganizationId', {
      __type: 'Pointer',
      className: 'contracts_Organizations',
      objectId: orgRes.id,
    });
    teamCls.set('IsActive', true);
    const teamRes = await teamCls.save(null, { useMasterKey: true });
    const updateUser = new Parse.Object('contracts_Users');
    updateUser.id = extUser.objectId;
    updateUser.set('UserRole', 'contracts_Admin');
    updateUser.set('OrganizationId', {
      __type: 'Pointer',
      className: 'contracts_Organizations',
      objectId: orgRes.id,
    });
    updateUser.set('TeamIds', [
      {
        __type: 'Pointer',
        className: 'contracts_Teams',
        objectId: teamRes.id,
      },
    ]);
    const extUserRes = await updateUser.save(null, { useMasterKey: true });
  } catch (err:any) {
    console.log('err in add team, role, org', err);
  }
}
