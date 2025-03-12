const Ajv = require('ajv');
const schema = require('../landofile-spec.json');
const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });

describe('Landofile Schema Validation', () => {
  const validate = ajv.compile(schema);

  test('validates a basic valid landofile', () => {
    const validLandofile = {
      name: 'myapp',
      recipe: 'lamp',
      config: {
        via: 'apache'
      }
    };
    
    const valid = validate(validLandofile);
    expect(valid).toBe(true);
  });

  test('rejects invalid app name', () => {
    const invalidLandofile = {
      name: 'INVALID_NAME!',
      recipe: 'lamp'
    };
    
    const valid = validate(invalidLandofile);
    expect(valid).toBe(false);
    expect(validate.errors).toContainEqual(
      expect.objectContaining({
        keyword: 'pattern',
        instancePath: '/name'
      })
    );
  });

  test('validates proxy configuration', () => {
    const landofileWithProxy = {
      name: 'myapp',
      recipe: 'lamp',
      proxy: {
        appserver: [
          'myapp.lndo.site',
          {
            hostname: 'custom.lndo.site',
            port: 80,
            pathname: '/api'
          }
        ]
      }
    };
    
    const valid = validate(landofileWithProxy);
    expect(valid).toBe(true);
  });

  test('rejects invalid proxy hostname pattern', () => {
    const landofileWithInvalidProxy = {
      name: 'myapp',
      recipe: 'lamp',
      proxy: {
        appserver: [
          'invalid!!hostname.lndo.site'
        ]
      }
    };
    
    const valid = validate(landofileWithInvalidProxy);
    expect(valid).toBe(false);
    expect(validate.errors).toBeTruthy();
  });

  test('validates MySQL service with creds', () => {
    const landofileWithMySqlCreds = {
      name: 'myapp',
      recipe: 'lamp',
      services: {
        default: {
          type: 'mysql:8.0',
          portforward: true,
          creds: {
            user: 'meuser',
            password: 'mepassword',
            database: 'meapp'
          }
        }
      }
    };
    
    const valid = validate(landofileWithMySqlCreds);
    expect(valid).toBe(true);
  });

  test('validates MariaDB service with creds', () => {
    const landofileWithMariaDbCreds = {
      name: 'myapp',
      recipe: 'lamp',
      services: {
        default: {
          type: 'mariadb',
          portforward: true,
          creds: {
            user: 'drupal11',
            password: 'drupal11',
            database: 'drupal11'
          }
        }
      }
    };
    
    const valid = validate(landofileWithMariaDbCreds);
    expect(valid).toBe(true);
  });

  test('validates MySQL service with version and creds', () => {
    const landofileWithMySqlVersionCreds = {
      name: 'myapp',
      recipe: 'lamp',
      services: {
        default: {
          type: 'mysql:5.7',
          portforward: true,
          creds: {
            user: 'drupal11',
            password: 'drupal11',
            database: 'drupal11'
          }
        }
      }
    };
    
    const valid = validate(landofileWithMySqlVersionCreds);
    expect(valid).toBe(true);
  });

  test('rejects creds with non-MySQL/MariaDB service type', () => {
    const landofileWithInvalidCreds = {
      name: 'myapp',
      recipe: 'lamp',
      services: {
        default: {
          type: 'php:8.2',
          creds: {
            user: 'meuser',
            password: 'mepassword',
            database: 'meapp'
          }
        }
      }
    };
    
    const valid = validate(landofileWithInvalidCreds);
    expect(valid).toBe(false);
    expect(validate.errors).toBeTruthy();
  });

  test('rejects incomplete creds configuration', () => {
    const landofileWithIncompleteCreds = {
      name: 'myapp',
      recipe: 'lamp',
      services: {
        default: {
          type: 'mysql:8.0',
          creds: {
            user: 'meuser',
            password: 'mepassword'
            // missing database
          }
        }
      }
    };
    
    const valid = validate(landofileWithIncompleteCreds);
    expect(valid).toBe(false);
    expect(validate.errors).toBeTruthy();
  });

  test('rejects empty creds values', () => {
    const landofileWithEmptyCreds = {
      name: 'myapp',
      recipe: 'lamp',
      services: {
        default: {
          type: 'mysql:8.0',
          creds: {
            user: '',
            password: 'doggie123',
            database: 'drupal11'
          }
        }
      }
    };
    
    const valid = validate(landofileWithEmptyCreds);
    expect(valid).toBe(false);
    expect(validate.errors).toBeTruthy();
  });
}); 