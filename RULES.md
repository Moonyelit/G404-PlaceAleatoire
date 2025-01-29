# Règles de codage pour le projet Classroom Seating App

## Objectif

Ce fichier définit les règles et bonnes pratiques pour le développement du projet Classroom Seating App.

## Conventions de codage

- **Style de code** : Suivre PSR-12 pour PHP et les bonnes pratiques JavaScript.
- **Nommage** :
  - Variables : `camelCase`
  - Fonctions : `camelCase`
  - Classes : `PascalCase`
- **Naming** : Les noms doivent refléter leur objectif.

- **Commentaires** : Ajouter des commentaires pour expliquer les sections complexes.

## Bonnes pratiques

- **Sécurité** : Éviter les injections SQL en utilisant des requêtes paramétrées.
- **Performance** : Éviter les boucles imbriquées inutiles.
- **Gestion des erreurs** : Toujours utiliser des blocs `try-catch` pour gérer les exceptions.

## Spécifications techniques

- **Frameworks** : Utiliser Tailwind pour le front end.

## Testing Guidelines

- **Unit Tests** : Utiliser PHPUnit pour les tests unitaires.
- **Coverage** : Viser une couverture de code d'au moins 80%.
- **Naming** : Les noms des tests doivent refléter leur objectif.
- **Frequency** : Exécuter les tests à chaque commit.

Ces règles doivent être strictement suivies pour garantir la cohérence et l'efficacité du développement.