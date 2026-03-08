# Conception de l'Interface Utilisateur (UI)

Ce document décrit le design et la structuration de l'interface utilisateur (UI) du Front-end Next.js, en s'inspirant fortement de l'expérience utilisateur (UX) de la capture d'écran de l'application Manus de référence.

---

## 1. Structure Générale de l'Écran

L'application adopte un layout en pleine page (Full-Screen Layout), optimisé pour des écrans de bureau (Desktop-first), et est composée de deux grandes sections principales :
1.  **Sidebar Gauche (Menu & Navigation)** : Fixe, pour naviguer entre les campagnes et les paramètres.
2.  **Zone Principale (Chat & Espace de travail)** : Défilable, contient l'interaction avec l'Agent et les résultats.

Le thème visuel privilégié est le **Dark Mode** (Mode sombre) pour une esthétique moderne et professionnelle, en utilisant les couleurs natives de Tailwind CSS (slate, zinc, dark).

---

## 2. La Sidebar Gauche (Menu)

La barre latérale s'occupe de l'organisation et du contexte, divisée en plusieurs parties :

### A. Entête
-   **Header / Logo** : Le nom de l'application (ex: `OpenExpertManus`), potentiellement avec un bouton pour replier/déplier la barre (Collapse).

### B. Navigation Principale
Des liens clairs avec des icônes (`lucide-react`) :
-   📝 **Nouveau Chat / Campagne** (`/campaigns/new`) : Bouton d'action principal pour démarrer un nouveau processus.
-   🤖 **Agents** (`/agents`) : Un menu spécifique permettant de gérer ou de sélectionner les différents agents disponibles (ex: AgentMarketing, AgentData, Manus).
-   🔍 **Recherche** : Pour chercher dans l'historique des requêtes et rapports.
-   📚 **Bibliothèque (Rapports)** (`/saved-reports`) : Accès rapide aux fichiers Markdown/SEO générés par le `FileSaver`.

### C. Historique des Campagnes (Projets / Tâches)
-   **Catégorie "Campagnes Récentes"** ou "All tasks".
-   Une liste des dernières requêtes effectuées par l'utilisateur (ex: *"Comment améliorer le SEO et mark..."*), permettant de reprendre une conversation passée ou de revoir le suivi en direct.

### D. Footer
-   Un module en bas (ex: *"Paramètres"*, *"Share with a friend"*, *"Credits"*) et l'icône de profil utilisateur.

---

## 3. La Zone Principale (Le Chat et l'Espace de Travail)

Cette zone est le cœur de l'application, alimentée par **Vercel AI SDK**.

### A. La Barre Supérieure (TopBar)
-   **Sélecteur d'Agent Dynamique** : Un menu déroulant (Dropdown) très visible en haut (ex: là où il est écrit *"Manus 1.6 Lite"* dans la référence). L'utilisateur pourra y cliquer pour switcher entre **AgentMarketing**, **DataAnalysis**, ou le modèle générique.
-   **Outils transversaux** : Boutons d'action (Partager ↗️, Paramètres de la campagne •••, Exporter).

### B. Le Flux de Discussion (Timeline)
Au lieu d'un simple chat textuel, l'interface doit montrer le cheminement de la pensée de l'agent :
-   L'agent affiche son *Thought Process* ("Pensées").
-   **Blocs d'appels d'outils (Tool calls)** : Quand l'agent utilise un outil (ex: `SERPAnalyzer` ou `LinkedInBrowser`), cela s'affiche sous forme de petit badge ou bloc distinct avec une icône (ex: 📎 *"Read the SocialMedia hero image section"*).
-   **Résultats riches (UI Générative)** : Les rapports finaux s'affichent sous forme de riches composants (tableaux de mots cibles, graphiques de `DataAnalysis`, rendu Markdown propre).

### C. L'Input Principal (Zone de Saisie)
En bas de l'écran (fixé au bas de la zone de scroll) :
-   Une boîte de texte multilingne pour écrire le prompt (ex: *"Gère la campagne SEO pour [Client X] et extrais des contacts LinkedIn"*).
-   **Contrôles intégrés à l'Input** :
    -   `+` (Pièce jointe / fichiers).
    -   Icône **Outils / Plugins** : Pour activer ou désactiver manuellement certains outils si besoin.
    -   Bouton **Envoyer** (ou Microphone).

---

## 4. Les Composants Techniques à Créer (shadcn/ui)

Pour arriver à ce résultat, nous allons utiliser et assembler les composants shadcn/ui suivants :
1.  `<Sidebar />` (nouveau composant de shadcn) ou construction manuelle avec Flex/Grid et `<ScrollArea />` pour la partie gauche.
2.  `<DropdownMenu />` et `<Select />` pour le choix de l'agent dans la barre du haut.
3.  `<Input />` / `<Textarea />` pour la boîte de prompt, enveloppée dans un container avec `<Button size="icon">` pour les envois.
4.  L'affichage des messages via des composants custom (ex: `<ChatMessage />`, `<ToolCallBadge />`) stylisés avec `border`, `bg-muted`, etc. pour bien séparer la réflexion de l'agent du texte final.
