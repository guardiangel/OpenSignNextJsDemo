import Parse from 'parse/node';

export function defineGetcontact() {
  Parse.Cloud.define('getcontact', async (request) => {
    const contactId = request.params.contactId;
    try {
      const contactCls = new Parse.Query('contracts_Contactbook');
      const contactRes = await contactCls.get(contactId, {
        useMasterKey: true,
      });
      return contactRes;
    } catch (err:any) {
      console.log('Err in contracts_Contactbook class ', err);
      throw err;
    }
  });
}
