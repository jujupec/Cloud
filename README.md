# Database nba mongodb
les fichier csv sont dans le dossier csv.

##  1ere étape

Créer votre base de donnée NBA mongodb et insérer les fichier csv en tant que collections. (mongoimport)

lancé la connection à votre base de donnée

## 2e étape

Ouvrez le projet cloud dans un IDE.
Ouvrer un terminal et placer vous à la racine du projet et entrer npm install ou sudo npm install


Dans app.js, il faut remplacer semon votre connection à votre base de données au lignes 42, 88 et 110.
Si vous utiliser sans docker: http://localhost:[port]/NBA .
avec docker : mongodb://localhost:[port]/NBA

Voilà vous n'avez plus qu'à lancer le projet, dans le terminal, vous vous positionner à la racine du projet et vous lancer la commande : node app.js.


