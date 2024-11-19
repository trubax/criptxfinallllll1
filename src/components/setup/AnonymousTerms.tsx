import { Clock } from 'lucide-react';

export function AnonymousTerms({ onAccept }: { onAccept: () => void }) {
  return (
    <div className="prose theme-text max-w-none">
      <h2>Termini di Utilizzo Account Anonimo CriptX</h2>
      
      <div className="flex items-center gap-2 p-4 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-500 mb-6">
        <Clock className="w-5 h-5" />
        <p className="m-0">
          L'account anonimo scadrà automaticamente dopo 24 ore dalla creazione
        </p>
      </div>

      <h3>1. Durata dell'Account</h3>
      <p>
        - L'account anonimo ha una durata limitata di 24 ore dalla creazione
        - Allo scadere del tempo, l'account e tutti i dati associati verranno eliminati automaticamente
        - Non è possibile estendere la durata dell'account oltre le 24 ore
      </p>

      <h3>2. Limitazioni</h3>
      <p>
        - Non è possibile recuperare i messaggi dopo la scadenza dell'account
        - Non è possibile convertire un account anonimo in un account permanente
        - Non è possibile visualizzare o modificare il profilo personale
        - Non sono disponibili le funzioni di chiamata
        - Non è possibile bloccare altri utenti
        - È possibile comunicare con tutti gli utenti tramite richiesta di chat
      </p>

      <h3>3. Privacy e Sicurezza</h3>
      <p>
        - I messaggi sono crittografati end-to-end
        - Non vengono memorizzate informazioni personali
        - L'account non è collegato a nessun dato identificativo
        - Le conversazioni possono essere bloccate da utenti registrati
        - Gli utenti registrati possono accettare o rifiutare le richieste di chat
      </p>

      <h3>4. Responsabilità</h3>
      <p>
        - L'utente è responsabile del backup dei dati importanti prima della scadenza
        - CriptX non è responsabile per la perdita di dati dopo la scadenza
        - L'uso improprio dell'anonimato comporterà la chiusura immediata dell'account
      </p>

      <div className="mt-8 flex justify-end">
        <button
          onClick={onAccept}
          className="px-4 py-2 rounded-lg theme-bg-accent theme-text"
        >
          Accetto i Termini dell'Account Anonimo
        </button>
      </div>
    </div>
  );
} 