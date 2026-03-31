using System.Security.Principal;
using BonhommePendu.Models;

namespace BonhommePendu.Events
{
    // Un événement à créer chaque fois qu'un utilisateur essai une "nouvelle" lettre
    public class GuessEvent : GameEvent
    {
        public override string EventType { get { return "Guess"; } }

        // TODO: Compléter
        public GuessEvent(GameData gameData, char letter)
        {
            // 1. Initialiser la liste pour contenir les sous-événements
            Events = new List<GameEvent>();

            // 2. Événement : La lettre a été tentée (Met à jour gameData.guessedLetters sur le client)
            Events.Add(new GuessedLetterEvent(gameData, letter));

            bool found = false;
            // 3. Boucle pour trouver toutes les positions de la lettre
            for (int i = 0; i < gameData.Word.Length; i++)
            {
                if (gameData.HasSameLetterAtIndex(letter, i))
                {
                    // On ajoute un événement de révélation pour chaque position trouvée
                    Events.Add(new RevealLetterEvent(gameData, letter, i));
                    found = true;
                }
            }

            // 4. Si la lettre n'était pas dans le mot
            if (!found)
            {
                // Cet événement va incrémenter nbWrongGuesses et faire avancer le dessin du pendu
                Events.Add(new WrongGuessEvent(gameData));
            }

            // --- VÉRIFICATION DE FIN DE PARTIE ---
            // On vérifie l'état de gameData APRÈS avoir appliqué les changements ci-dessus

            if (gameData.HasGuessedTheWord)
            {
                // Déclenche le "Félicitations!" dans ton HTML
                Events.Add(new WinEvent(gameData));
            }
            // On perd généralement à la 7e erreur (le pendu complet)
            else if (gameData.NbWrongGuesses >= 7)
            {
                // Déclenche le message d'échec et affiche le mot caché
                Events.Add(new LoseEvent(gameData));
            }
        }
    }
}
