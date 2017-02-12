# Documentation Scroller

Ce script permet de faciliter la mise en place d'un traitement lors du scroll. Il gère nativement l'affichage d'éléments pendant le scroll.

## Initialisation

    var Scroller = new $.Scroller();


## Options

| Option                            | Type     | Valeur par défaut    | Description                                                                                          |
|-----------------------------------|----------|----------------------|------------------------------------------------------------------------------------------------------|
| axis                              | string   | 'y'                  | Axe du scroll                                                                                        |
| containerDimensions               | boolean  | false                | Récupère les dimensions du conteneur au chargement et resize                                         |
| timeout                           | integer  | 0                    | Temps d'attente avant une réponse du callback au scroll                                              |
| displayElements                   | object   | Voir ci-dessous      | Liste les options ci-dessous                                                                         |
| &nbsp;&nbsp;&nbsp;&nbsp;element   | object   | undefined            | Élément jQuery pour identifier les éléments à afficher au scroll                                     |
| &nbsp;&nbsp;&nbsp;&nbsp;percent   | integer  | 60                   | Limite d'affichage en pourcentage par rapport au coin en haut à gauche du conteneur                  |
| &nbsp;&nbsp;&nbsp;&nbsp;hide      | boolean  | false                | Masque l'élément s'il est en dehors de la limite d'affichage                                         |
| &nbsp;&nbsp;&nbsp;&nbsp;onShow    | function | undefined            | Callback une fois l'action exécutée                                                                  |
| &nbsp;&nbsp;&nbsp;&nbsp;onHide    | function | undefined            | Callback une fois l'action exécutée                                                                  |
| classes                           | object   | Voir ci-dessous      | Liste les options ci-dessous                                                                         |
| &nbsp;&nbsp;&nbsp;&nbsp;prefix    | string   | 'scroller'           | Préfix de classe                                                                                     |
| &nbsp;&nbsp;&nbsp;&nbsp;toDisplay | string   | '{prefix}-toDisplay' | Classe pour identifier les éléments à afficher au scroll si displayElements.element n'est pas défini |
| &nbsp;&nbsp;&nbsp;&nbsp;hidden    | string   | 'is-hidden'          | Classe pour indiquer si l'élément est masqué                                                         |
| onComplete                        | function | undefined            | Callback une fois Scroller initialisé                                                                |

## Méthodes

| Méthode                | Arguments                                                       | Description                                                           |
|------------------------|-----------------------------------------------------------------|-----------------------------------------------------------------------|
| setOptions             | **options** *object* Liste des options à modifier               | Permet de définir de nouvelles options                                |
| onScroll               | **[callback]** *function* Callback à executer pendant le scroll | Permet d'initialiser un événement au scroll et d'executer un callback |
| displayElements        | **[options]** *object* Options utilisateur                      | Permet d'afficher des éléments pendant le scroll                      |
| getOffset              | **[type]** *string* **current** ou **previous**                 | Permet de récupérer l'offset actuel ou précédent du conteneur         |
| getContainerDimensions | -                                                               | Permet de récupérer les dimensions du conteneur                       |
| getScrollDirection     | -                                                               | Permet de récupérer la direction du scroll                            |