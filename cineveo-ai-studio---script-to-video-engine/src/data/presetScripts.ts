import { VisualStyle } from '../types';

export interface PresetScript {
  id: string;
  title: string;
  category: string;
  style: VisualStyle;
  recommendedDuration: number;
  description: string;
  script: string;
}

export const PRESET_SCRIPTS: PresetScript[] = [
  {
    id: 'manga-shonen-flame',
    title: 'Ryuga & Kento: Fiamme dell\'Infinito',
    category: 'Manga Shōnen Action',
    style: 'Manga Shōnen Action',
    recommendedDuration: 30,
    description: 'Azione Shōnen ad altissima tensione: aura di fuoco, linee cinetiche, colpi impattanti e onomatopee sonore a tutto schermo.',
    script: `EST. MONTE DEL DRAGO SACRO - NOTTE DI TEMPESTA

Vento tempestoso. RYUGA, giovane guerriero con capelli a punta scarmigliati e fascia frontale, stringe i pugni da cui erompe un'aura di fuoco scoppiettante.
Di fronte a lui, KENTO, rivale dallo sguardo impassibile con una lancia di ghiaccio runica.

RYUGA:
(urlo viscerale, fiamme cremisi negli occhi)
Non m'importa quanto sia spesso il tuo ghiaccio, Kento! Questa è tutta la mia volontà!

KENTO:
(socchiude gli occhi, scattando a mezz'aria)
Parli troppo, Ryuga. Dimostramelo con i fatti!

Ryuga carica in avanti a velocità sovrumana, la terra si spacca sotto i suoi stivali con un boato sismico. Le due energie collidono a centro campo generando un'esplosione circolare di luce dorata!`
  },
  {
    id: 'manga-bw-ink',
    title: 'Samurai delle Ombre: Capitolo 47',
    category: 'Manga B&W Inchiostrato',
    style: 'Manga B&W Inchiostrato',
    recommendedDuration: 30,
    description: 'Tavola manga classica giapponese in bianco e nero inchiostrato: retini (screentones), tratteggio a pennino g-pen, kanji onomatopeici ドドド e contrasto puro.',
    script: `EST. FORESTA DI BAMBÙ - CREPUSCOLO IN BIANCO E NERO

Fruscio di canne di bambù tagliate dal vento. Retini grafici manga e tratteggio a inchiostro di china.
JINBEI, ronin con cappello di paglia e kimono strappato, cammina a passi lenti e calcolati. Il ronzio dell'acciaio che scivola dal fodero.
Dall'ombra sbuca l'ASSASSINO MASCHERATO con shuriken pronti al lancio.

ASSASSINO:
(voce sibilante, postura felina tra i rami)
La tua testa vale cento monete d'oro nella capitale, Jinbei. Consegna la spada e avrai una morte rapida.

JINBEI:
(il pollice fa scattare l'elsa con un riflesso bianco accecante)
Chi cerca la mia spada... trova solo l'inchiostro del proprio destino.

Flash di taglio in bianco e nero puro. Il bambù cade tagliato di netto in due mentre i due guerrieri si scambiano di posto!`
  },
  {
    id: 'anime-cyberpunk',
    title: 'Neo-Tokyo Overdrive: Hacker Unit',
    category: 'Cyberpunk Anime',
    style: 'Cyberpunk Neo-Tokyo Anime',
    recommendedDuration: 45,
    description: 'Anime cyberpunk metropolitano: ologrammi al neon magenta e ciano, asfalto bagnato con riflessi ottici e droni di sorveglianza.',
    script: `EST. DISTRETTO 9 NEO-TOKYO - NOTTE DI PIOGGIA NEON

Insegne olografiche galleggianti in ciano e magenta. Cavi cibernetici penzolanti da grattacieli titanici.
YUKI, mercenaria cyborg con giacca lucida e visore ottico luminoso, corre lungo la passerella metallica mentre proiettili al plasma sibilano alle sue spalle.
AI-NEXUS parla nell'auricolare con voce sintetica.

YUKI:
(schivando una raffica con una scivolata sull'asfalto bagnato)
Nexus! Ho scaricato il nucleo dati, ma i mech di sorveglianza hanno isolato il ponte!

NEXUS:
(frequenza radio modulata)
Sovraccarico i lampioni del settore tra tre secondi. Quando salta la rete ottica, lanciati verso il condotto inferiore!

I lampioni esplodono in scintille violacee. Yuki salta nel vuoto attivando i propulsori magnetici degli stivali!`
  },
  {
    id: 'pixar-bakery',
    title: 'Gusto & Pip: Il Robot Pasticcere',
    category: 'Animazione 3D',
    style: '3D Pixar Cartoon',
    recommendedDuration: 30,
    description: 'Un piccolo robot pasticcere e il suo topolino apprendista tentano la ricetta della torta fluttuante più spettacolare del mondo.',
    script: `INT. PASTICCERIA MAGICA - GIORNO

GUSTO, un robottino bombato color crema con grandi occhi blu luminosi ed espressivi, gira freneticamente tra fruste di rame e sac à poche.
PIP, un topolino vivace con un minuscolo cappello da chef, atterra sulla bilancia.

PIP:
(saltellando impaziente)
Gusto! La polvere di vaniglia cosmica si sta sciogliendo! Sbrigati prima che evapori!

GUSTO:
(emette un trillo acustico entusiasta e afferra la spatola dorata)
Temperatura calcolata al milligrammo, Pip! Tre, due, uno... soffio dorato!

Gusto versa l'ingrediente magico. La torta lievita fluttuando nell'aria emanando particelle zuccherate scintillanti.

PIP:
(con gli occhi spalancati di meraviglia)
È viva! Gusto, sta volando verso il soffitto! Prendila!`
  },
  {
    id: 'noir-1952',
    title: 'L\'Ombra del Passato: Detective Sterling',
    category: 'Giallo Vintage B&W',
    style: 'Black & White Vintage 50s/70s',
    recommendedDuration: 30,
    description: 'Un vicolo nebbioso sotto la pioggia battente nel 1952. Un trench coat bagnato, lampioni tremolanti e un segreto mai svelato.',
    script: `EST. VICOLO BARKER - NOTTE PIOVOSA 1952

Pioggia battente in bianco e nero contrastato. Riflessi di pozzanghere scure. Il DETECTIVE STERLING, trench stropicciato e cappello fedora abbassato sugli occhi, accende un fiammifero che illumina il suo volto spigoloso.
Dall'angolo buio emerge ELEANOR, avvolta in una sciarpa scura di seta.

ELEANOR:
(voce vellutata e tesa, guardandosi alle spalle)
Sei venuto Sterling. Speravo non avessi perso l'abitudine di rischiare la pelle.

STERLING:
(lascia cadere il fiammifero nell'acqua scura con uno sguardo d'acciaio)
La curiosità costa un dollaro e cinquanta all'ora in questa città, Eleanor. E tu mi devi ancora la verità su quella cassetta di sicurezza.`
  },
  {
    id: 'hollywood-sci-fi',
    title: 'Aura Protocol: Infiltrazione Neomark',
    category: 'Cinema Hollywood',
    style: 'Film Cinema Hollywood',
    recommendedDuration: 45,
    description: 'Produzione cinematografica da blockbuster hollywoodiano: anamorfico 35mm, luci al neon e tensione adrenalinica tra due agenti d\'élite.',
    script: `INT. CORRIDOIO DEL REATTORE NEOMARK - NOTTE

Illuminazione di emergenza ambrata, lente anamorfica con bagliore orizzontale ciano. VAPORE ad alta pressione sibila dai tubi industriali.
AGENTE VANCE controlla il mirino olografico mentre cammina con passo felpato a ridosso delle paratie di titanio.
DR. CHEN decritta il terminale di sicurezza con dita febbricitanti.

VANCE:
(sussurrando via radiomicrofono, sguardo vigile sul corridoio)
Chen, i sensori sismici indicano che la squadra di estrazione è a due minuti. Quel portellone deve aprirsi adesso.

CHEN:
(schermo riflesso negli occhiali, battiti accelerati)
Il firewall quantistico sta cambiando le chiavi di accesso ogni tre secondi! Ho quasi aggirato il circuito primario... fatto!`
  }
];
