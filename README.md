# Anonymously-Secrets-with-different-levels-of-security
<h2>OK, here's the little Secrets project, that allows users to post some random stuff anonymously, but most important, shows diiferent levels of security and authentication <a href="https://github.com/meandrewandyou/Anonymously-Secrets-with-different-levels-of-security/network">methods.</a></h2>
<h3>Level 1: just registering new Users and allow em to the secret page only if they registered. </h3>
<h3>Level 2: encrypting user's data via <i>mongoose-encryption</i>, adding enviroment variables via <i>.env</i>. </h3>
<h3>Level 3: encrypting user's data via <i>md5</i>, which has no decryption method and makes passwords more secure. </h3>
<h3>Level 4: hashing and salting passwords via <i>bcrypt</i>. </h3>
<h3>Level 5: implementing sessions and cookies authentication methods to keep users logged-in via <i>express-session</i>,<i>passport.js</i>, <i>passport-local</i>, <i>passport-local-mongoose</i>. </h3>
<h3>Level 6: google authentication added. Now we don't need to worry about user's data safety. Big guys will do it for us.</h3>
<h2>Warning! Everybody warning! Most of front-end was pre-made, so it's not my secret on levels 1-4)</h2>
