


## Working of application

![app flow diagram](readme_files/app_flow.svg)

The above diagram describes chat application. The diagram should understood as follows:

### Top Level Module

| Component | Description |
| -------- | ---------- |
| Web Application | The user interface, to display data. This component does not have direct access to application. |
| API | This part of the application provides data to display. It further is divided into several components, where each sub component is responsible for specific data. |

### API Sub Modules

| Component | Description |
|--------- | ----------- |
| Auth		| Handles login, and register routes, also checks if user is online or offline |
| Friends | Provides data about user friends. |
| Preferences | Provides user preferences data |
| Channels | Provides data about subscribed channels, and also feature to search new channels. |
| Notifications | Provides notifications data for the required user. |

## Auth Module

There are two types of authentication system supported by the application:

- Authentication via (Email and Password)
- Authentication via (AUTH_TOKEN)

The idea behind this module is that:

- The application boots to login screen.
- The login screen, checks if user is logged in.
	- If user is logged in, (check credentials via ajax request)
	- Else prompt user for login
- (checking credentials) login provides credentials via ajax request.
	- If incorrect credentials, then  ask user to login again.
	- Else redirect to index page.
- User is now at index page.

The routes in the api are:

|	Route 						| Method  	|	Description 			 |
| ----------------------------  | ------- 	| -------------------------- |
| /auth/login/ 					| POST		| Login user by a secret key |
| /auth/login 		|			| POST 		| Login user by credentials  |
| /auth/check/<user_id> 		| GET 		| Check if the user is online or offline |
| /auth/logout/					| POST		| Logout user by a secret key |

> Secret key will be provided in headers as **AUTH_TOKEN** parameter.

![auth api flow](readme_files/auth_flow.svg)