# TinyApp Project

TinyApp is a full stack REST web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

Users can save their own list of short URLs and provide the links to others online.

TinyApp will keep track of how many times the link is clicked and how many times the link is clicked by a unique user (so no cheating).

Tiny app stores encrypted passwords with bcrypt and uses encrypted cookies with cookie-session for a secure URL shortening experience, so you can REST easy!

## Final Product

### Registration Page
!["Registration Page"](/Photos/RegisterPage.png?raw=true "Registration Page")

### My URLs Page
!["My URLs Page"](/Photos/myURLs.png?raw=true "My URLs Page")

### Edit URL Page
!["Edit URL Page"](/Photos/editURL.png?raw=true "Edit URL Page")

## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session
- method-override

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
- Then just type in the url to your server and you're hosting URLs!