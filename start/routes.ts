/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer''
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async ({ view }) => {
  return view.render('welcome')
})

Route.post('/auth/register', 'AuthController.register').as('auth.register')
Route.post('/auth/login', 'AuthController.login').as('auth.login')
Route.get('/auth/logout', 'AuthController.logout').as('auth.logout')

Route.group(() => {
  
  Route.get('/manage', 'UsersController.manage').as('manage')
  Route.patch('/:id/role', 'UsersController.role').as('role')
  Route.delete('/:id', 'UsersController.destroy').as('destroy')

}).prefix('users').as('users').middleware(['auth', 'role:admin'])