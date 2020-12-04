# Telar MVC

[![npm](https://img.shields.io/npm/v/telar-mvc.svg?style=flat-square)](https://www.npmjs.com/package/telar-mvc)
 [![npm](https://img.shields.io/npm/dm/telar-mvc.svg?style=flat-square)](https://www.npmjs.com/package/telar-mvc)
[![npm](https://img.shields.io/npm/l/telar-mvc.svg?style=flat-square)](https://www.npmjs.com/package/telar-mvc)

Lightweight powerful implementation of MVC(Model-View-Controller) for Node servers. Inspired by [inversify-controller](https://github.com/bluebirds-blue-jay/inversify-controller).

## Requirements

- `node >= 7.10`
- `typescript >= 2.4`

## Installation
1. Install prerquire packages

```sh
npm i koa @koa/router ajv reflect-metadata telar-mvc
````
2. Install IoC container
   - e.g. Inversify Conainter
   
      ```sh
      npm i inversify
      ```

3. Make sure to import `reflect-metadata` before using `ajv-class-validaitor`:

```
import "reflect-metadata";
```

4. Must add below options in your `tsconfig.json`:
```
{
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
}


## Note on JSON schemas

We use [AJV](https://github.com/epoberezkin/ajv) internally for schema validation. Decorators that perform schema validation offer you to create your own AJV instance through the `ajvFactory` option. If you are to create your own instances through this option, we highly recommend to make sure you pass the same options we use along with yours, otherwise some assumptions from this documentation might not be true.

Although you can use plain JSON schemas, we recommend the use of Bluejay's [schema](https://github.com/bluebirds-blue-jay/schema) module for easier schema manipulation. The examples below make use of this module, but be aware that you can use plain JSON schemas instead. 

## Usage

### Creating a controller

```typescript
import { Controller, path } from 'telar-mvc';

@Path('/')
class HomeController extends Controller {
  
}
```

### Binding your controller to your application using Inversify container

The `bind()` helper correlates your app, your container and your controllers.

```typescript
import { bind, IController, Controller } from 'telar-mvc';
import * as Koa from 'koa';
import { container } from './inversify.config';
import { HomeController, UserController, ProductController  } from './controllers';

// NOTE: Make sure to decorate the `Controller` class from `tela-mvc` if you are using inversify. 
// This line should run right before binding and only should run ONE time!!!
decorate(injectable(), Controller);

const identifiers = {
    HomeController: Symbol('HomeController'),
    UserController: Symbol('UserController'),
    ProductController: Symbol('ProductController'),
};

this.container.bind<IController>(identifiers.HomeController).to(HomeController);
this.container.bind<IController>(identifiers.UserController).to(UserController);
this.container.bind<IController>(identifiers.ProductController).to(ProductController);

const app = new Koa();

/**
 * app: Koa app
 * container: Implementation of IContainer or any IoC Container implemented `get<T>(TYPE)` method like Inversify or TypeDI
 * controller identifiers: A list of controller identifiers 
 * NOTE: This is required and must happen early in your application, ideally right after your create your app
 */
bind(app, container, [identifiers.HomeController, identifiers.UserController, identifiers.ProductController]);
```

### Middlewares

This module encourages you to declare middlewares at the controller level (vs. at the app level). This gives you the same result as if you were using `app.use()`, but keeps everything in the same place.

```typescript
import { before, after } from 'telar-mvc';
import { bodyParser } from 'koa-bodyparser';
import { errorHandler } from '../error-handler';

@Before(bodyParser())
@After(errorHandler())
@Path('/')
class HomeController extends Controller {
  
}
```

Below we register a middleware that's specific to the UsersController.

```typescript
@Path('/users')
@Before(logMiddleware) // Only /users routes (and descendants) will be affected
class UsersController extends Controller {
  
}
```

#### Passing arguments to middlewares

There are times where you need to inject some properties into a middleware, which properties are accessible in the controller itself. `@BeforeFactory` and `@AfterFactory` allow you to differ a middleware's creation.

```typescript
@BeforeFactory(function(this: HomeController) { // Notice the usage of a regular function
  return logMiddlewareFactory(this.logger);
})
class HomeController extends Controller {
  @inject(Identifiers.LoggerService) public logger: ILoggerService;  
}
```

#### Route level middlewares

Route level middlewares are declared the exact same way as controller middlewares, using `@Before`, `@After` and `@BeforeFactory`. `@AfterFactory` is currently not supported.

```typescript
class UsersController extends Controller {
  private foo: string = 'bar';
  
  @Get('/')
  @Before(queryParser())
  @Before(async function(this: UsersController, ctx: RouterContext, next: Next) {
    console.log(this.foo); // bar
    await next();
  })
  public async list(ctx: RouterContext) {
    
  }
}
```

### Declaring routes

This module offers http decorators for all HTTP verbs. Check each decorator's documentation for specific options.

```typescript
class UsersController extends Controller {
  
  @Get('/')
  public async list(ctx: RouterContext) {
    
  }
  
  @Get('/:id')
  public async getById(ctx: RouterContext) {
      
  }
  
  @Post('/')
  public async add(ctx: RouterContext) {
      
  }
  
  @Del('/:id')
  public async removeById(ctx: RouterContext) {
    
  }
  
  // ...
}
```

### Class model validation

You can use decorators for your class model`(from MVC)` to validate your request body. We use [ajv-class-validator](https://github.com/Qolzam/ajv-class-validator) to change conver json to object and validate. The model object is injected in the context.

```typescript

import { ActionModel } 'telar-mvc';
import { MaxLength, Required } from 'ajv-class-validator';

export class User {
   
  @MaxLength(15)
  public name: string 

  constructor(
      @Required()
      public id: string,
  ) {
    this.id = id
  }
}

class UsersController extends Contoller {
  @Get('/:id')
  @ActionModel(User) // <---- Should define to access model in `ctx: RouterContext`
  public async save({ model }) {
    if (model.validate()) {
      db.save(model);
    } else {
      console.log(model.errors()); // output errors - if options can passed to AJV `{allErrors: true}` you will have the list of errors
      ctx.status = 400
    }
  }
}
```

### Path parameters validation

Path parameters have to be declared in your route's path. Additionally, this module offers validation and type coercion through JSON schemas and the `@Params()` decorator.   

```typescript
import { object, integer, requireProperties } from '@bluejay/schema'; 

class UsersController extends Contoller {
  @Get('/:id')
  @Params(requireProperties(object({ id: integer() }), ['id']))
  public async getById(ctx: RouterContext) {
    const { id } = req.params;
    console.log(typeof id); // number, thanks to Ajv's "coerceTypes" option
  }
}
```

An instance of AJV is created by default, if you want to pass your own, provide a `ajvFactory` to the options.

```typescript
import { object, integer, requireProperties } from '@bluejay/schema';
import * as Ajv from 'ajv';

const idParamSchema = object({ id: integer() });

class UsersController extends Contoller {
  @Get('/:id')
  @Params({
    jsonSchema: requireProperties(idParamSchema, ['id']),
    ajvFactory: () => new Ajv({ coerceTypes: true })
  })
  public async getById(ctx: RouterContext) {
    const { id } = req.params;
    console.log(typeof id); // number
  }
}
```

If the params don't match `jsonSchema`, a `BadRequest` error will be thrown and be handled by your error middleware, meaning that your handler will never be called.


##### Query parameters validation

Query parameters are validated through JSON schemas using the `@Query()` decorator.

All HTTP method decorators also accept an optional `query` option with the same signature as the decorator.

```typescript
import { object, boolean } from '@bluejay/schema';

class UsersController extends Controller {
  @Get('/')
  @Query(object({ active: boolean() }))
  public async list(ctx: RouterContext) {
    const { active } = req.query;
    console.log(typeof active); // boolean | undefined (since not required)
  }
}
```

A `BadRequest` error will be thrown in case the query doesn't match the described schema, in which case your handler will never be called.

##### Grouping query parameters

Groups allow you to group properties from the `query` object and are managed by a `groups` hash of the form `{ [groupName]: groupProperties }`.

Those come handful if your application exposes complex query parameters to the end user, and you need to pass different properties to different parts of your application. 

```typescript
class UsersController extends Controller {
  
  @Query({
    jsonSchema: object({ active: boolean(), token: string() }),
    groups: { filters: ['active'] }
  })
  @Get('/')
  public async list(ctx: RouterContext) {
    const { filters, token } = req.query;
    console.log(typeof token); // string
    console.log(typeof filters); // object
    console.log(typeof filters.active); // boolean | undefined (since not required)
    console.log(req.query.active); // undefined (grouped properties are removed from the root query)
  }
}
```

##### Transforming query parameters

`transform` allows you to process and modify the query string before the groups are formed. This is useful if, for example the interface your application offers to its consumers differs from the interface used within the application. 

*Note:* The `transform` hook is called before parameters are grouped. Also note that you can use `transform` without groups.

```typescript

const queryTransformer = (query: object) => {
  query.active = query.isActive;
  delete query.isActive; // Clean
  return query;
};

class UsersController extends Controller {
  @Query({
    jsonSchema: object({ isActive: boolean() }),
    transform: queryTransformer
  })
  @Get('/')
  public async list(ctx: RouterContext) {
    const { active } = req.query;
    console.log(typeof active); // boolean
    console.log(typeof req.query.isActive); // undefined
  }
}
```

### Body validation

We currently only offer validation for JSON body. You can declare bodies of another type, but you will need to handle the validation by yourself. Bodies are managed through the `@Body()` decorator.

#### JSON body

```typescript
const userSchema = object({
  email: email(),
  password: string(),
  first_name: string({ nullable: true }),
  last_name: string({ nullable: true })
});

class UsersController extends Controller {
  @Post('/')
  @Body(requireProperties(userSchema, ['email', 'password']))
  public async add(ctx: RouterContext) {
    // req.body is guaranteed to match the described schema
  }
}
```

A `BadRequest` error will be thrown in case the body doesn't match the described schema, in which case your handler will never be called.

#### Other types

The only validation possible for now is the content type, and this is done via the `@Is` decorator, which validates the content type of the body.

```typescript
class UsersController extends Controller {
  @Put('/:id/picture')
  @Is('image/jpg')
  @Before(multer.single('file')) // Just an example, see https://www.npmjs.com/package/@koa/multer
  public async changePicture(ctx: RouterContext) {
    
  }
}
```

## API Documentation

> TODO
