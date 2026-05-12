// Application principale

let auditResults = [];

// Gestion du formulaire
document.getElementById('auditForm').addEventListener('submit', handleAuditSubmit);

function handleAuditSubmit(e) {
  e.preventDefault();

  const audit = {
    date: document.getElementById('auditDate').value,
    cie: document.getElementById('auditCie').value,
    vol: document.getElementById('auditVol').value,
    agent: document.getElementById('auditAgent').value,
    tso: document.getElementById('auditTso').value,
    check_terrain: document.getElementById('auditCheckTerrain').checked,
    check: document.getElementById('auditCheck').checked,
    debrief: document.getElementById('auditDebrief').checked,
    commentaire: document.getElementById('auditCommentaire').value,
    timestamp: new Date().toISOString(),
  };

  // Validation
  const validationResult = validateAudit(audit);

  // Afficher les messages
  const messageDiv = document.getElementById('validationMessages');
  messageDiv.innerHTML = '';

  if (validationResult.errors.length > 0) {
    validationResult.errors.forEach(err => {
      messageDiv.innerHTML += `<div class="message error">❌ ${err}</div>`;
    });
    document.getElementById('messageSection').style.display = 'block';
    return;
  }

  // Afficher les avertissements et le succès
  if (validationResult.warnings.length > 0) {
    validationResult.warnings.forEach(warn => {
      messageDiv.innerHTML += `<div class="message warning">${warn}</div>`;
    });
  }

  messageDiv.innerHTML += `<div class="message success">✅ Contrôle enregistré avec succès!</div>`;
  document.getElementById('messageSection').style.display = 'block';

  // Ajouter aux résultats
  auditResults.push(audit);
  updateResultsTable();

  // Réinitialiser
  document.getElementById('auditForm').reset();
  document.getElementById('selectFlight').value = '';
  clearAuditForm();
}

function updateResultsTable() {
  const container = document.getElementById('resultsContainer');

  if (auditResults.length === 0) {
    container.innerHTML = '<p class="results-empty">Aucun contrôle effectué</p>';
    return;
  }

  let html = `<table>
    <tr>
      <th>Date</th>
      <th>Compagnie</th>
      <th>Vol</th>
      <th>Agent</th>
      <th>TSO</th>
      <th>Terrain</th>
      <th>Contrôle</th>
      <th>Debriefing</th>
      <th>Heure</th>
    </tr>`;

  auditResults.forEach((audit, index) => {
    const time = new Date(audit.timestamp).toLocaleTimeString('fr-FR');
    html += `<tr>
      <td>${audit.date}</td>
      <td><strong>${audit.cie}</strong></td>
      <td>${audit.vol}</td>
      <td>${audit.agent || '-'}</td>
      <td>${audit.tso || '-'}</td>
      <td>${audit.check_terrain ? '✅' : '❌'}</td>
      <td>${audit.check ? '✅' : '❌'}</td>
      <td>${audit.debrief ? '✅' : '❌'}</td>
      <td>${time}</td>
    </tr>`;
  });

  html += '</table>';
  container.innerHTML = html;
}

function exportAllResults() {
  if (auditResults.length === 0) {
    alert('⚠️ Aucun résultat à exporter');
    return;
  }

  const exportData = {
    exportDate: new Date().toISOString(),
    user: 'User_' + Math.random().toString(36).substr(2, 9),
    totalAudits: auditResults.length,
    audits: auditResults
  };

  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `audit_${new Date().toISOString().slice(0, 10)}_${new Date().getHours()}-${new Date().getMinutes()}.json`;
  a.click();

  showMessage('✅ Résultats téléchargés', 'success');
}

document.getElementById('importFile').addEventListener('change', handleImportResults);

function handleImportResults(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const importedData = JSON.parse(event.target.result);
      const auditsToImport = importedData.audits || [importedData];

      auditResults = [...auditResults, ...auditsToImport];
      updateResultsTable();

      showMessage(`✅ ${auditsToImport.length} résultats importés`, 'success');
    } catch (error) {
      showMessage(`❌ Erreur lors de l'import: ${error.message}`, 'error');
    }
  };
  reader.readAsText(file);
}

function clearAllResults() {
  if (confirm('⚠️ Êtes-vous sûr? Cette action est irréversible.')) {
    auditResults = [];
    updateResultsTable();
    showMessage('✅ Résultats supprimés', 'success');
  }
}

function showMessage(message, type = 'info') {
  const messageDiv = document.getElementById('validationMessages');
  messageDiv.innerHTML = `<div class="message ${type}">${message}</div>`;
  document.getElementById('messageSection').style.display = 'block';
}