# Documentation - Export JS Enrichi

## Améliorations apportées

Dans la macro VBA `Export_JS`, ajout d'un nouveau champ pour exporter les données de contrôle terrain en plus du contrôle dossier.

### Nouvelle fonctionnalité : Ajout du champ "check_terrain"

**Besoin :** Exporter séparément les informations de contrôle terrain et contrôle dossier.

**Solution :** Ajout d'un nouveau champ `check_terrain` dans l'export JavaScript.

```vba
' ✅ NOUVEAU : check_terrain (colonne R)
objLines.Add "    , check_terrain: " & BoolJS(ws.Cells(i, "R").Value)

' ✅ EXISTANT : check (colonne S - check dossier)
objLines.Add "    , check: " & BoolJS(ws.Cells(i, "S").Value)

' ✅ EXISTANT : debrief (colonne V)
objLines.Add "    , debrief: " & BoolJS(ws.Cells(i, "V").Value)
```

## Résumé des champs de contrôle

| Champ | Colonne | Description | Statut |
|-------|---------|-------------|--------|
| check_terrain | R | Check terrain | ✅ Nouveau champ ajouté |
| check | S | Check dossier | ✅ Existant (maintenu) |
| debrief | V | Débriefing avec l'agent | ✅ Existant (maintenu) |

## Mapping des colonnes

Pour référence, voici le mapping des colonnes utilisées dans l'export :

- **Colonne E** : Date
- **Colonne G** : Compagnie (cie)
- **Colonne H** : Vol (vol)
- **Colonne R** : Check ✅ (CORRIGÉ)
- **Colonne T** : Agent
- **Colonne U** : TSO
- **Colonne V** : Debrief
- **Colonne AE** (31) : Commentaire
- **Colonne 30** : errors_count
- **Colonne 47** : History
- **Colonnes 49-200** : Codes d'erreur

## Liste des erreurs (colonnes 48-145)

Les codes d'erreur sont organisés par catégorie (0-6) :

### Catégorie 0 (Colonnes 48-49)
- 48: Commentaire - TEXTBOX 48
- 49: Autre erreur / Divers (ALS)

### Catégorie 1 (Colonnes 50-52)
- 50: ULD / Chariot non positioné
- 51: Alerte BAG toujours active
- 52: Manque Bingo pris en GATE

### Catégorie 2 (Colonnes 60-67)
- 60: Date, N° de vol, Immat erronées
- 61: Signature C2 manquante
- 62: Signature R/A manquante
- 63: Case Security check (elle ne doit pas être coché) - EW
- 64: Politique de chargement non respectée
- 65: Remarque manquante (WCMP...)
- 66: Information manquante (nb bag ...)
- 67: Non Correspondance LIR/BAGERA -Bingo

### Catégorie 3 (Colonnes 75-79)
- 75: DATA incorrecte (DOW, DOI, REG.....)
- 76: Signature par Captain manquante
- 77: Signature par COORDO manquante
- 78: Non correspondance LDS & LIR
- 79: LMC incorrecte

### Catégorie 4 (Colonnes 85-106)
- 85: MVT non envoyé
- 86: Format MVT incorrect
- 87: Erreur Calcul DL
- 88: DL code utilisé incorrect
- 89: Erreur DATA (pax, reg, date...)
- 90: Manque SI MVT
- 91: LDM non envoyé
- 92: Format LDM incorrect
- 93: DATA LDM incorrect
- 94: Manque SI LDM
- 95: CPM non envoyé
- 96: Format CPM incorrect
- 97: DATA CPM incorrect
- 98: Manque SI CPM
- 99: UCM IN non envoyé
- 100: UCM IN incorrect
- 101: UCM OUT non envoyé
- 102: UCM OUT incorrect
- 103: FNL non envoyé
- 104: FNL incorrect
- 105: DCS non GD/ Finalisé
- 106: Flight Report

### Catégorie 5 (Colonnes 115-117)
- 115: Dossier de vol partiellement rempli
- 116: Docs cie/GEH non correctement renseigné (preciser en dessous)
- 117: Commentaire - TEXTBOX 117

### Catégorie 6 (Colonnes 120-145)
- 120: AGOA non fait
- 121: Manque ATD / ATA - ADO / ADC
- 122: Jalon non terminé
- 123: Sous tâche jalon - info manquante (Below)
- 124: DL manquant / Erroné
- 125: Agoa non envoyé
- 130-145: Divers documents (MVT ARV, LMD ARV, UCM IN, etc.)

## Installation

Pour utiliser cette macro corrigée :

1. Ouvrez votre fichier Excel
2. Appuyez sur `Alt + F11` pour ouvrir l'éditeur VBA
3. Importez le fichier `Export_JS.bas` ou copiez le code dans un nouveau module
4. Fermez l'éditeur VBA
5. Exécutez la macro `Export_JS` depuis Excel

## Notes importantes

- Le fichier de sortie est créé à l'emplacement : `G:\Web App Nico\En developpement\Suivi de contrôle\data_1.js`
- Modifiez la variable `chemin` dans le code si vous souhaitez changer l'emplacement de sortie
- La macro commence à lire les données à partir de la ligne 10
- Les données sont exportées au format JavaScript (const data_1 = [...])
