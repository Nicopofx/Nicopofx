# Exemple de sortie JavaScript

## Structure de l'objet exporté

Après l'exécution de la macro `Export_JS`, le fichier `data_1.js` contiendra un tableau d'objets avec la structure suivante :

```javascript
const data_1 = [
  {
    date: "2024-01-15"
    , cie: "Air France"
    , vol: "AF1234"
    , check_terrain: true      // ✅ NOUVEAU : Check terrain (colonne R)
    , check: false             // Check dossier (colonne S)
    , agent: "Jean Dupont"
    , tso: "TSO123"
    , debrief: true            // Débriefing avec l'agent (colonne V)
    , commentaire: "Vol sans incident"
    , errors_count: 2
    , error_codes: [50, 60]
    , tags: ["LIR", "AGOA"]
    , history: "Historique du vol"
    , has_comment: true
  }
  ,
  {
    date: "2024-01-16"
    , cie: "Lufthansa"
    , vol: "LH5678"
    , check_terrain: false     // ✅ NOUVEAU : Check terrain (colonne R)
    , check: true              // Check dossier (colonne S)
    , agent: "Marie Martin"
    , tso: "TSO456"
    , debrief: false           // Débriefing avec l'agent (colonne V)
    , commentaire: ""
    , errors_count: 0
    , error_codes: []
    , tags: []
    , history: ""
    , has_comment: false
  }
];
```

## Différences par rapport à la version précédente

### Avant (version originale)
```javascript
{
  date: "2024-01-15"
  , cie: "Air France"
  , vol: "AF1234"
  , check: false             // Lisait colonne S (check dossier)
  , agent: "Jean Dupont"
  // ... autres champs
}
```

### Après (version améliorée)
```javascript
{
  date: "2024-01-15"
  , cie: "Air France"
  , vol: "AF1234"
  , check_terrain: true      // ✅ NOUVEAU : Colonne R (check terrain)
  , check: false             // Colonne S (check dossier)
  , agent: "Jean Dupont"
  // ... autres champs
}
```

## Mapping complet des colonnes

| Champ JavaScript | Colonne Excel | Type | Description |
|------------------|---------------|------|-------------|
| date | E | String | Date au format yyyy-mm-dd |
| cie | G | String | Compagnie aérienne |
| vol | H | String | Numéro de vol |
| **check_terrain** | **R** | **Boolean** | **✅ Nouveau : Check terrain** |
| check | S | Boolean | Check dossier |
| agent | T | String | Nom de l'agent |
| tso | U | String | TSO |
| debrief | V | Boolean | Débriefing avec l'agent |
| commentaire | AE (31) | String | Commentaire |
| errors_count | 30 | Number | Nombre d'erreurs |
| error_codes | 49-200 | Array | Codes d'erreur cochés |
| tags | AE (31) | Array | Tags extraits des commentaires |
| history | 47 | String | Historique |
| has_comment | AE (31) | Boolean | Indique si un commentaire existe |

## Utilisation dans le code JavaScript

Avec cette nouvelle structure, vous pouvez maintenant distinguer les deux types de contrôle :

```javascript
// Filtrer les vols avec check terrain effectué
const volsAvecCheckTerrain = data_1.filter(vol => vol.check_terrain === true);

// Filtrer les vols avec check dossier effectué
const volsAvecCheckDossier = data_1.filter(vol => vol.check === true);

// Filtrer les vols avec débriefing effectué
const volsAvecDebrief = data_1.filter(vol => vol.debrief === true);

// Vols avec tous les contrôles effectués
const volsComplets = data_1.filter(vol => 
  vol.check_terrain === true && 
  vol.check === true && 
  vol.debrief === true
);
```
