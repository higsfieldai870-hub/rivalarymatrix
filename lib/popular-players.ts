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

export const roleLabels: Record<Role, string> = {
  forward: "Strikers",
  winger: "Wingers",
  midfielder: "Midfielders",
  defender: "Defenders",
  goalkeeper: "Goalkeepers",
};
