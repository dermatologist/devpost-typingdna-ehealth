# Notes

## Template

* https://www.digitalocean.com/community/tutorials/how-to-build-a-lightweight-invoicing-app-with-node-database-and-api

and Add

```
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
```

and

```
function isEmpty(strIn) {
  if (strIn === undefined) {
    return true;
  } else if (strIn == null) {
    return true;
  } else if (strIn == "") {
    return true;
  } else {
    return false;
  }
}
```

node scripts/migrate.js up