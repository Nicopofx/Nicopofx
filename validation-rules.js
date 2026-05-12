// Règles de validation des audits

function validateAudit(audit) {
  const errors = [];
  const warnings = [];

  // Validation des champs obligatoires
  if (!audit.date) errors.push('La date est obligatoire');
  if (!audit.cie) errors.push('La compagnie aérienne est obligatoire');
  if (!audit.vol) errors.push('Le numéro de vol est obligatoire');

  // Validation du format de la date
  if (audit.date && !isValidDate(audit.date)) {
    errors.push('Format de date invalide');
  }

  // Validation du numéro de vol
  if (audit.vol && isNaN(audit.vol)) {
    errors.push('Le numéro de vol doit être un nombre');
  }

  // Validation de la compagnie aérienne (doit être dans la base)
  if (audit.cie && !flightExists(audit)) {
    warnings.push('⚠️ Vol non trouvé dans la base de données');
  }

  // Avertissements
  if (!audit.check_terrain) {
    warnings.push('Terrain non contrôlé');
  }

  if (!audit.check) {
    warnings.push('Contrôle non effectué');
  }

  if (!audit.agent && !audit.tso) {
    warnings.push('Ni agent ni TSO n\'a été saisi');
  }

  return { errors, warnings };
}

function isValidDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

function flightExists(audit) {
  return flightDatabase.some(f =>
    f.date === audit.date &&
    f.cie.toUpperCase() === audit.cie.toUpperCase() &&
    parseInt(f.vol) === parseInt(audit.vol)
  );
}