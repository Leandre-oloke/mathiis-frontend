// Help-centre questions and answers (from the app's help page), shared by /dashboard/help and the Ctrl+K palette.
export type Faq = { id: string; q: string; a: string };
export type FaqGroup = { id: string; title: string; items: Faq[] };

export const faq: FaqGroup[] = [
  { id: "generation-epreuves", title: "Génération d’épreuves", items: [
    { id: "generer-epreuve", q: "Comment générer une épreuve ?", a: "Depuis \"Générer une épreuve\", choisissez la classe, les notions à couvrir et la durée, puis lancez la génération. L’IA crée un contexte, une tâche et plusieurs exercices adaptés au niveau choisi." },
    { id: "classes-supportees", q: "Quelles classes sont supportées ?", a: "De la 6e en Terminale (toutes les séries), selon le programme officiel béninois." },
    { id: "combien-temps-prend-generation", q: "Combien de temps prend la génération d’une épreuve ?", a: "Généralement moins d’une minute, selon la complexité et la charge du serveur." },
    { id: "choisir-notions-chapitres-inclure", q: "Puis-je choisir les notions/chapitres à inclure dans l’épreuve ?", a: "Oui, une liste de notions est proposée selon la classe sélectionnée ; vous pouvez en choisir plusieurs." },
    { id: "regenerer-partie-epreuve-elle", q: "Puis-je régénérer une partie de l’épreuve si elle ne me convient pas ?", a: "Oui, vous pouvez régénérer un exercice précis sans relancer toute l’épreuve." },
  ] },
  { id: "import-correction", title: "Import et correction d’épreuves", items: [
    { id: "importer-epreuve-existante-faire", q: "Comment importer une épreuve existante pour la faire corriger ?", a: "Depuis \"Mes corrigés\", importez votre fichier, puis choisissez la classe pour lancer la correction automatique." },
    { id: "formats-fichiers-acceptes", q: "Quels formats de fichiers sont acceptés ?", a: "PDF, Word (.docx) et texte brut, jusqu’à 5 Mo. Les PDF scannés (images) sont aussi acceptés grâce à la reconnaissance de texte automatique." },
    { id: "combien-temps-prend-generation-2", q: "Combien de temps prend la génération d’un corrigé ?", a: "Quelques dizaines de secondes à quelques minutes selon la longueur de l’épreuve." },
    { id: "graphiques-figures-geometriques-ils", q: "Les graphiques et figures géométriques sont-ils bien pris en charge dans les corrigés ?", a: "Oui, les courbes, figures géométriques et histogrammes sont générés automatiquement quand l’énoncé les demande." },
  ] },
  { id: "telechargement-gestion", title: "Téléchargement et gestion des documents", items: [
    { id: "formats-telecharger-epreuves-corriges", q: "Sous quels formats puis-je télécharger mes épreuves et corrigés ?", a: "PDF et Word (.docx)." },
    { id: "retrouver-epreuves-corriges-precedemment", q: "Où retrouver mes épreuves et corrigés précédemment générés ?", a: "Dans \"Mes épreuves\" pour les épreuves générées, et \"Mes corrigés\" pour les documents importés." },
    { id: "supprimer-epreuve-document-importe", q: "Puis-je supprimer une épreuve ou un document importé ?", a: "Oui, depuis la liste correspondante." },
  ] },
  { id: "quotas-abonnement", title: "Quotas et abonnement", items: [
    { id: "combien-epreuves-corriges-generer", q: "Combien d’épreuves/corrigés puis-je générer gratuitement ?", a: "Un quota gratuit est offert à l’inscription ; au-delà, vous pouvez recharger votre compte via un paiement Mobile Money." },
    { id: "fonctionne-paiement", q: "Comment fonctionne le paiement ?", a: "Le paiement se fait via FedaPay, en Mobile Money MTN, directement depuis la page Abonnement." },
    { id: "passe-quand-atteins-limite", q: "Que se passe-t-il quand j’atteins ma limite de génération ?", a: "Un message vous invite à recharger votre compte pour continuer à générer des épreuves/corrigés." },
    { id: "credits-achetes-expirent-ils", q: "Les crédits achetés expirent-ils ?", a: "Non, vos crédits restent disponibles tant que vous ne les avez pas utilisés." },
  ] },
  { id: "compte-securite", title: "Compte et sécurité", items: [
    { id: "creer-compte-reinitialiser-mot", q: "Comment créer un compte / réinitialiser mon mot de passe ?", a: "Inscrivez-vous depuis la page d’accueil. En cas d’oubli du mot de passe, cliquez sur \"Mot de passe oublié\" sur la page de connexion pour recevoir un lien de réinitialisation par email." },
    { id: "donnees-epreuves-elles-privees", q: "Mes données et mes épreuves sont-elles privées ?", a: "Oui, seules vous pouvez accéder à vos épreuves et documents." },
    { id: "supprimer-compte", q: "Puis-je supprimer mon compte ?", a: "Contactez-nous via le formulaire ci-dessous, nous traiterons votre demande." },
  ] },
  { id: "problemes-techniques", title: "Problèmes techniques", items: [
    { id: "telechargement-pdf-fonctionne-pas", q: "Le téléchargement du PDF ne fonctionne pas, que faire ?", a: "Vérifiez que vous êtes bien connecté, puis réessayez. Si le problème persiste, contactez-nous ci-dessous." },
    { id: "epreuve-generee-affiche-erreur", q: "L’épreuve générée affiche une erreur, que faire ?", a: "Essayez de régénérer l’épreuve ou l’exercice concerné ; si l’erreur persiste, signalez-la nous." },
    { id: "site-indique-plateforme-temporairement", q: "Le site indique que la plateforme est temporairement suspendue, que faire ?", a: "Il s’agit d’une maintenance planifiée. Réessayez plus tard, ou contactez-nous si la suspension dure anormalement longtemps." },
  ] },
];
