// The players whose head-to-heads get indexed. Every pair of them is a
// comparison page in the sitemap; pairs in the same role rank higher, and
// the iconic rivalries higher still. Names are full names as BSD knows them
// (first + last name), since that is what comparison URLs are built from.

export type Role = "forward" | "winger" | "midfielder" | "defender" | "goalkeeper";

export type PopularPlayer = { name: string; role: Role };

export const popularPlayers: PopularPlayer[] = [
  // Forwards
  { name: "Lionel Messi", role: "forward" },
  { name: "Cristiano Ronaldo", role: "forward" },
  { name: "Erling Haaland", role: "forward" },
  { name: "Kylian Mbappé", role: "forward" },
  { name: "Harry Kane", role: "forward" },
  { name: "Robert Lewandowski", role: "forward" },
  { name: "Lautaro Martínez", role: "forward" },
  { name: "Victor Osimhen", role: "forward" },
  { name: "Julián Álvarez", role: "forward" },
  { name: "Alexander Isak", role: "forward" },
  { name: "Viktor Gyökeres", role: "forward" },
  { name: "Karim Benzema", role: "forward" },
  // Wingers
  { name: "Lamine Yamal", role: "winger" },
  { name: "Vinícius Júnior", role: "winger" },
  { name: "Mohamed Salah", role: "winger" },
  { name: "Bukayo Saka", role: "winger" },
  { name: "Michael Olise", role: "winger" },
  { name: "Raphinha", role: "winger" },
  { name: "Khvicha Kvaratskhelia", role: "winger" },
  { name: "Ousmane Dembélé", role: "winger" },
  { name: "Rafael Leão", role: "winger" },
  { name: "Neymar", role: "winger" },
  { name: "Son Heung-min", role: "winger" },
  // Midfielders
  { name: "Jude Bellingham", role: "midfielder" },
  { name: "Pedri", role: "midfielder" },
  { name: "Kevin De Bruyne", role: "midfielder" },
  { name: "Florian Wirtz", role: "midfielder" },
  { name: "Jamal Musiala", role: "midfielder" },
  { name: "Cole Palmer", role: "midfielder" },
  { name: "Martin Ødegaard", role: "midfielder" },
  { name: "Federico Valverde", role: "midfielder" },
  { name: "Declan Rice", role: "midfielder" },
  { name: "Bruno Fernandes", role: "midfielder" },
  { name: "Luka Modrić", role: "midfielder" },
  { name: "Gavi", role: "midfielder" },
  { name: "Vitinha", role: "midfielder" },
  // Defenders
  { name: "Virgil van Dijk", role: "defender" },
  { name: "William Saliba", role: "defender" },
  { name: "Rúben Dias", role: "defender" },
  { name: "Achraf Hakimi", role: "defender" },
  { name: "Trent Alexander-Arnold", role: "defender" },
  { name: "Antonio Rüdiger", role: "defender" },
  { name: "Alessandro Bastoni", role: "defender" },
  // Goalkeepers
  { name: "Thibaut Courtois", role: "goalkeeper" },
  { name: "Alisson", role: "goalkeeper" },
  { name: "Gianluigi Donnarumma", role: "goalkeeper" },
  { name: "Marc-André ter Stegen", role: "goalkeeper" },
  { name: "Emiliano Martínez", role: "goalkeeper" },
];

// Rivalries fans actually search for, in the order they are usually said.
export const iconicRivalries: [string, string][] = [
  ["Lionel Messi", "Cristiano Ronaldo"],
  ["Erling Haaland", "Kylian Mbappé"],
  ["Lamine Yamal", "Kylian Mbappé"],
  ["Lamine Yamal", "Michael Olise"],
  ["Pedri", "Jude Bellingham"],
  ["Vinícius Júnior", "Lamine Yamal"],
  ["Mohamed Salah", "Bukayo Saka"],
  ["Harry Kane", "Erling Haaland"],
  ["Robert Lewandowski", "Harry Kane"],
  ["Kevin De Bruyne", "Bruno Fernandes"],
  ["Florian Wirtz", "Jamal Musiala"],
  ["Cole Palmer", "Bukayo Saka"],
  ["Lionel Messi", "Neymar"],
  ["Cristiano Ronaldo", "Karim Benzema"],
  ["Virgil van Dijk", "William Saliba"],
  ["Thibaut Courtois", "Alisson"],
];

// Why each iconic rivalry matters, keyed by the names above. Kept to what
// won't date: no season stats or current clubs.
const iconicNotes: Record<string, string> = {
  "Lionel Messi|Cristiano Ronaldo":
    "The debate that defined a generation. Two players who rewrote the scoring records in Spain and Europe, built in completely different ways.",
  "Erling Haaland|Kylian Mbappé":
    "Power against pace. The two forwards expected to dominate the post-Messi and Ronaldo era, both scoring at a rate few have matched.",
  "Lamine Yamal|Kylian Mbappé":
    "El Clásico's sharpest edge: Barcelona's teenage prodigy against Real Madrid's established superstar.",
  "Lamine Yamal|Michael Olise":
    "Two left-footers on the right wing who cut inside to create, dribble for dribble and assist for assist.",
  "Pedri|Jude Bellingham":
    "The Clásico midfield battle: Barcelona's calm, press-resistant passer against Madrid's box-crashing goal threat.",
  "Vinícius Júnior|Lamine Yamal":
    "Clásico wingers on opposite flanks, both built to beat a full-back one against one.",
  "Mohamed Salah|Bukayo Saka":
    "Liverpool against Arsenal on the right wing: two left-footed wide forwards who carry their teams' goal threat.",
  "Harry Kane|Erling Haaland":
    "Complete forward against pure finisher. Kane drops deep to create; Haaland lives in the six-yard box.",
  "Robert Lewandowski|Harry Kane":
    "Bayern Munich's number nines, before and after. The comparison every Bayern fan has made since Kane arrived.",
  "Kevin De Bruyne|Bruno Fernandes":
    "The playmakers who shaped Manchester's midfields, City's and United's, measured on chances created and end product.",
  "Florian Wirtz|Jamal Musiala":
    "Germany's two creative jewels, the same age and position, often picked together and endlessly compared.",
  "Cole Palmer|Bukayo Saka":
    "England's competition for the right side: two left-footed creators chasing the same place in the starting line-up.",
  "Lionel Messi|Neymar":
    "Teammates at Barcelona and Paris Saint-Germain, and two of the most gifted dribblers of the modern game.",
  "Cristiano Ronaldo|Karim Benzema":
    "Real Madrid's partnership through its most successful era in Europe: the finisher and the forward who made space for him.",
  "Virgil van Dijk|William Saliba":
    "Liverpool against Arsenal at the back: two composed, quick centre-backs who rarely lose a duel.",
  "Thibaut Courtois|Alisson":
    "Two of the best goalkeepers of the era, both Champions League winners, compared on saves and goals conceded.",
};

// The note for a pair in either order, if it is an iconic rivalry.
export const rivalryNote = (left: string, right: string): string | undefined =>
  iconicNotes[`${left}|${right}`] ?? iconicNotes[`${right}|${left}`];

export const roleLabels: Record<Role, string> = {
  forward: "Strikers",
  winger: "Wingers",
  midfielder: "Midfielders",
  defender: "Defenders",
  goalkeeper: "Goalkeepers",
};
