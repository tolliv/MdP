//==========================================================
// MdP
// Gestionnaire de mots de passe
// Largeur écran X15U = 384
//==========================================================

// Clé de chiffrement
let gKey;
let gKeyString = ""
const gStorage = "MdP-Content";

//----------------------------------------------------------
// MAIN
//----------------------------------------------------------
// Attente chargement de tous les éléments
document.addEventListener('DOMContentLoaded', function()
{
  //---------- DEBUG ----------
  setTimeout(function()
  {
    gKeyString = "";
    pressKey('DEL');
    if (gKeyString != "")
      Entrer();
  }, 100);
});


//----------------------------------------------------------
// Raccourci sur les éléments du DOM
//----------------------------------------------------------
function pid(id)
{
  const element = document.getElementById(id);
  if (id == null)
    console.log("ID NULL (" + id + ")");
  return(element);
}

//----------------------------------------------------------
// Clavier Numérique pour le code
//----------------------------------------------------------
function pressKey(val)
{
  const lNbChiffres = 6;
  const hiddenInput = pid('code');
  const slots = document.querySelectorAll('.code-slot');

  // Supprimer le dernier chiffre
  if (val === 'DEL')
  {
    if (gKeyString != "")
      gKeyString = gKeyString.slice(0, -1);
  }

  // Ajouter un nouveau chiffre
  else
  {
    // Ajouter si on n'a pas atteint 6 chiffres
    if (gKeyString.length < lNbChiffres)
      gKeyString += val;
  }

  // Mettre à jour l'affichage visuel dans les carrés
  slots.forEach((slot, index) =>
  {
    if (gKeyString[index])
      slot.textContent = gKeyString[index];
    else
      slot.textContent = "";
  });

  // Gestion du bouton Valider
  if (gKeyString.length != lNbChiffres)
    pid('ButValider').disabled = true;
  else
    pid('ButValider').disabled = false;
}

//----------------------------------------------------------
// Le Code est saisi
//----------------------------------------------------------
function Entrer()
{
  // Lecture Clé et efface le code
  gKey = parseInt(gKeyString);
  gKeyString = "";
  pressKey('DEL');

  // Récupération du texte et déchiffrement
  let txtContent = localStorage.getItem(gStorage);

  // Il n'y a pas de texte en ce moment
  if ( (txtContent == null) || (txtContent == "") )
  {
    pid('TxtFormated').innerHTML = "(Vide)";
  }

  // Texte existant
  else
  {
    const txtDecoded = Dechiffrer(txtContent);

    if ( (Erreur > 0) || (gKey == null) || (gKey == 0) || (gKey == 1) )
    {
      pid('TxtFormated').innerHTML = "(ERREUR)";
    }
    else
    {
      const txtAffichage = ConversionHTML(txtDecoded);
      pid('TxtFormated').innerHTML = txtAffichage;
    }
  }
  // Affichage
  pid('scrCode').style.display='none';
  pid('scrHome').style.display='block';
}


//----------------------------------------------------------
// Fermer
//----------------------------------------------------------
function Fermer()
{
  pid('scrCode').style.display='block';
  pid('scrHome').style.display='none';
  pid('TxtFormated').innerHTML = "";
  pid('TxtInput').value = "";
}

//----------------------------------------------------------
// Editer
//----------------------------------------------------------
function Editer()
{
  pid('ButSauver').style.display='block';
  pid('ButExporter').style.display='block';

  // Récupération du texte et déchiffrement
  let txtContent = localStorage.getItem(gStorage);

  // Il n'y a pas de texte en ce moment
  if ( (txtContent == null) || (txtContent == "") )
  {
    pid('TxtInput').value = "(Vide)";
    pid('scrHome').style.display='none';
    pid('scrEdit').style.display='block';
  }

  // Texte existant
  else
  {
    const txtDecoded = Dechiffrer(txtContent);

    if ( (Erreur > 0) || (gKey == null) || (gKey == 0) || (gKey == 1) )
      pid('TxtInput').value = "(ERREUR)";

    else
      pid('TxtInput').value = txtDecoded;

    pid('scrHome').style.display='none';
    pid('scrEdit').style.display='block';
  }
}


//----------------------------------------------------------
// Chiffrement
//----------------------------------------------------------
function Chiffrer(txt)
{
  // Suppression des espaces à la fin du texte
  txt = txt.trimEnd();

  // Ajoute des espaces pour avoir multiple de 3
  while (txt.length % 3 != 0)
  {
    txt += ' ';
  }

  // Conversion en hexha
  let compteur = 0;
  let hex = '';
  for (let i = 0; i < txt.length; i+=3)
  {
    let Triplet;
    Triplet  = txt.charCodeAt(i+0)*256*256;
    Triplet += txt.charCodeAt(i+1)*256;
    Triplet += txt.charCodeAt(i+2);
    Triplet *= gKey;
    const hexValue = Triplet.toString(16);
    hex += hexValue.padStart(12, '0');
    compteur++;
    if (compteur >= 2)
    {
      hex += "\r";
      compteur = 0;
    }
  }
  return(hex);
}

//----------------------------------------------------------
// Déchiffrement
//----------------------------------------------------------
let Erreur = 0; // Pas d'erreur par défaut
function Dechiffrer(hexInput)
{
  Erreur = 0;
  // Supprime tous les espaces, \r, \n, etc.
  let hexCleaned = hexInput.replace(/\s/g, "");
  let decryptedText = "";

  // Parcourt par blocs de 12 caractères
  for (let i = 0; i < hexCleaned.length; i += 12)
  {
    let hexBlock = hexCleaned.slice(i, i + 12);

    if (hexBlock.length < 12)
    {
      Erreur++;
      continue;
    }

    // Conversion en nombre et vérification
    let numValue = parseInt(hexBlock, 16);
    let numValueDiv = Math.round(numValue / gKey);
    numValueVerif = numValueDiv * gKey;
    if (numValueVerif != numValue)
    {
      Erreur++;
    }

    // Extraire le triplet
    const charCode2 = numValueDiv % 256;         // 3ème caractère
    numValueDiv = numValueDiv / 256;
    const charCode1 = numValueDiv % 256;         // 2ème caractère
    numValueDiv = numValueDiv / 256;
    const charCode0 = numValueDiv % 256;         // 1er caractère

    decryptedText += String.fromCharCode(charCode0);
    decryptedText += String.fromCharCode(charCode1);
    decryptedText += String.fromCharCode(charCode2);
  }
  return(decryptedText);
}


//-------------------------------------------------------
// Conversion en HTML ligne par ligne
// "!R " en Rouge
// "!V " en Vert
// "!B " en Bleu
// "!N " en Noir
// "!P " en Pourpre (Violet)
//-------------------------------------------------------
function ConversionHTML(pTexte)
{
  const lLignes = pTexte.split("\n");
  let lFormated = "";
  let lFlag = 0;
  let lLigne = "";
  for (let i = 0; i < lLignes.length; i++)
  {
    lLigne = lLignes[i];
    const lDebut = lLigne.substring(0, 3);
    const lFin = lLigne.substring(3);
    if (lDebut == "!R ")
    {
      lLigne = "<span style='color: red;'><b>" + lFin + "</b></span>";
    }
    else if (lDebut == "!V ")
    {
      lLigne = "<span style='color: green;'><b>" + lFin + "</b></span>";
    }
    else if (lDebut == "!B ")
    {
      lLigne = "<span style='color: blue;'><b>" + lFin + "</b></span>";
    }
    else if (lDebut == "!N ")
    {
      lLigne = "<span style='color: black;'><b>" + lFin + "</b></span>";
    }
    else if (lDebut == "!P ")
    {
      lLigne = "<span style='color: purple;'><b>" + lFin + "</b></span>";
    }
    else
    {
      lLigne = "<span style='color: black;'>" + lDebut + lFin + "</span>";
    }
    lFormated += lLigne + "<br>";
  }
  return(lFormated);
}

//----------------------------------------------------------
// Annuler l'édition sans sauvegarder
// L'écran Home n'est pas modifié, donc on ne recharge rien
//----------------------------------------------------------
function Annuler()
{
  pid('scrEdit').style.display='none';
  pid('scrHome').style.display='block';
}


//----------------------------------------------------------
// Sauver
//----------------------------------------------------------
function Sauver()
{
  // Sauvegarde du texte chiffré
  const messageContent = Chiffrer(pid('TxtInput').value);
  localStorage.setItem(gStorage, messageContent);

  pid('TxtFormated').innerHTML = "";

  // Affichage
  pid('scrEdit').style.display='none';
  pid('scrHome').style.display='block';

  setTimeout(function()
  {
    // Récupération du texte et déchiffrement
    const txtContent = localStorage.getItem(gStorage);
    const txtDecoded = Dechiffrer(txtContent);
    const txtAffichage = ConversionHTML(txtDecoded);
    pid('TxtFormated').innerHTML = txtAffichage;
  }, 100);
}

//----------------------------------------------------------
// Importer
// décode en direct
//----------------------------------------------------------
function Importer()
{
  const txtDecoded = Dechiffrer(pid('TxtInput').value);
  if (Erreur == 0)
  {
    pid('TxtInput').value = txtDecoded;
    pid('ButSauver').style.display='block';
    pid('ButExporter').style.display='block';
  }
  else
  {
    pid('TxtInput').value = "ERREUR";
    pid('ButSauver').style.display='none';
    pid('ButExporter').style.display='none';
  }
}

//----------------------------------------------------------
// Exporter
// Recode en direct
//----------------------------------------------------------
function Exporter()
{
  pid('TxtInput').value  = Chiffrer(pid('TxtInput').value);
  pid('ButSauver').style.display='none';
  pid('ButExporter').style.display='none';
}


