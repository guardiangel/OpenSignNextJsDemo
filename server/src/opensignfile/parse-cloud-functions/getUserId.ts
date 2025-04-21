import Parse from 'parse/node';

export function defineGetUserId() {
  Parse.Cloud.define('getUserId', async (request) => {
    try {
      const username = request.params.username;
      const email = request.params.email;
      const query = new Parse.Query(Parse.User);
      if (username) {
        query.equalTo('username', username);
      } else {
        query.equalTo('email', email);
      }
      const user = await query.first({ useMasterKey: true });
      return { id: user.id };
    } catch (err:any) {
      console.log('err', err);
      return err;
    }
  });
}
