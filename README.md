# Business flow for the Firebase Chat App

# Login screen

1. In login screen enter the user name and check if he wants to register as expert or not.
2. The authentication was done by using the user name. if the user name was not present in db the it will be created along with the type expert or not.
3. If user was present in db then apart from the selection of expert user will be loged into the app.

# List screen
1. All the registerd users list will be displayed in that screen.
2. If the user was expert. '(expert)' will be appended at leading of the user name.
3. User can click and initiate the chat between with selected user.

# chat screen
1. Users can exchange the conversations.
2. Added the rate limit feature when current user was not Expert.
3. Rate limit feature will disabled if the user was expert.

