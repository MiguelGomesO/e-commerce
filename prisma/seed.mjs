import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

// Imagens em public/games/<slug>/{cover,hero}.jpg (arte oficial baixada da Steam).
// Preços (centavos) são valores de exemplo para a demo.
const games = [
  ["elden-ring", "Elden Ring", "PC", "RPG de ação", 22990, 25990, 120, 1245620,
    "Explore as Terras Intermédias, enfrente chefes imensos e monte seu próprio estilo de combate em um mundo aberto criado pela FromSoftware com George R. R. Martin."],
  ["baldurs-gate-3", "Baldur's Gate 3", "PC", "RPG", 24990, null, 85, 1086940,
    "RPG por turnos baseado em Dungeons & Dragons, com escolhas que mudam a história e cooperativo para até quatro jogadores."],
  ["cyberpunk-2077", "Cyberpunk 2077", "PC", "RPG de ação", 14990, 24990, 60, 1091500,
    "Jogue como V em Night City, uma metrópole obcecada por poder e modificações corporais, em um RPG de mundo aberto."],
  ["hades", "Hades", "PC", "Roguelike", 4990, 7390, 200, 1145360,
    "Fuja do Submundo como o príncipe Zagreu em um roguelike de ação rápida com história que avança a cada tentativa."],
  ["stardew-valley", "Stardew Valley", "PC", "Simulação", 2490, null, 300, 413150,
    "Herde uma fazenda, plante, crie animais, pesque, explore minas e faça amizade com os moradores do vale."],
  ["hollow-knight", "Hollow Knight", "PC", "Metroidvania", 2790, null, 150, 367520,
    "Desça ao reino de insetos de Hallownest em uma aventura de ação em 2D desenhada à mão, com muitos chefes e segredos."],
  ["celeste", "Celeste", "PC", "Plataforma", 3690, null, 180, 504230,
    "Ajude Madeline a escalar a montanha Celeste em um plataforma preciso, com história sobre ansiedade e superação."],
  ["portal-2", "Portal 2", "PC", "Quebra-cabeça", 1990, 3990, 250, 620,
    "Resolva quebra-cabeças com portais e gel em um modo de campanha e cooperativo cheio de humor."],
  ["disco-elysium", "Disco Elysium - The Final Cut", "PC", "RPG", 7990, 11990, 90, 632470,
    "Um RPG de detetive sem combate, em que as habilidades do protagonista são vozes que debatem dentro da sua cabeça."],
  ["cuphead", "Cuphead", "PC", "Ação e tiro", 3690, 4690, 140, 268910,
    "Run and gun com visual de desenho animado dos anos 1930, centrado em chefes difíceis e jogável em dupla."],

  // PlayStation
  ["god-of-war", "God of War", "PlayStation", "Ação e aventura", 12990, 19990, 70, 1593500,
    "Kratos e o filho Atreus atravessam os reinos nórdicos em uma jornada de combate intenso e história pessoal."],
  ["spider-man-remastered", "Marvel's Spider-Man Remastered", "PlayStation", "Ação e aventura", 19990, 24990, 65, 1817070,
    "Balance por Nova York como Peter Parker, enfrente vilões clássicos e proteja a cidade em um mundo aberto."],
  ["horizon-zero-dawn", "Horizon Zero Dawn Complete Edition", "PlayStation", "RPG de ação", 8990, 19990, 80, 1151640,
    "Como a caçadora Aloy, enfrente máquinas gigantes em um mundo pós-apocalíptico e descubra a origem delas."],
  ["the-last-of-us-part-1", "The Last of Us Part I", "PlayStation", "Aventura", 24990, null, 50, 1888930,
    "Joel e Ellie cruzam os Estados Unidos devastados por uma pandemia em uma aventura focada em narrativa e sobrevivência."],
  ["ghost-of-tsushima", "Ghost of Tsushima Versão do Diretor", "PlayStation", "Ação e aventura", 24990, 29990, 45, 2215430,
    "Como o samurai Jin Sakai, defenda a ilha de Tsushima da invasão mongol em um mundo aberto de combate com espada."],

  // Xbox
  ["forza-horizon-5", "Forza Horizon 5", "Xbox", "Corrida", 19990, 24990, 90, 1551360,
    "Corra livremente por um México vibrante, com centenas de carros e eventos para jogar sozinho ou online."],
  ["halo-mcc", "Halo: The Master Chief Collection", "Xbox", "Ação e tiro", 11990, null, 75, 976730,
    "Reúne as campanhas e o multiplayer clássicos de Halo em uma só coleção, com o Master Chief na linha de frente."],
  ["gears-5", "Gears 5", "Xbox", "Ação e tiro", 5990, 14990, 60, 1097840,
    "Tiro em terceira pessoa com campanha cooperativa, em que Kait Diaz descobre a verdade sobre sua origem."],
  ["sea-of-thieves", "Sea of Thieves", "Xbox", "Aventura", 9990, null, 110, 1172620,
    "Navegue com amigos, procure tesouros e enfrente outros piratas em um mundo compartilhado de aventura."],
  ["ori-will-of-the-wisps", "Ori and the Will of the Wisps", "Xbox", "Plataforma", 4990, 9990, 130, 1057090,
    "Plataforma em 2D de arte pintada à mão, com exploração, combate e uma trilha sonora emocionante."],

  // Switch
  ["terraria", "Terraria", "Switch", "Aventura e criação", 2990, null, 220, 105600,
    "Cave, construa, lute contra chefes e explore um mundo 2D gerado aleatoriamente, sozinho ou com amigos."],
  ["undertale", "Undertale", "Switch", "RPG", 2490, null, 160, 391540,
    "Um RPG em que você pode vencer batalhas sem lutar. Cada escolha muda como os monstros e a história respondem."],
  ["dead-cells", "Dead Cells", "Switch", "Roguelike", 5490, 7990, 100, 588650,
    "Roguelike de ação em 2D com combate ágil e um castelo que muda a cada tentativa."],
  ["vampire-survivors", "Vampire Survivors", "Switch", "Roguelike", 1790, null, 260, 1794680,
    "Sobreviva a hordas crescentes com armas que disparam sozinhas, em partidas curtas e viciantes."],
  ["among-us", "Among Us", "Switch", "Jogo de festa", 1490, null, 300, 945360,
    "Descubra quem são os impostores entre a tripulação, em partidas com amigos e muita discussão."],
];

// Remove o catálogo fictício da primeira versão (e pedidos de teste que o usavam).
const old = ["neon-drifter", "hollow-spire", "pocket-kingdoms", "saltwind-tactics", "ember-court", "glass-harbor", "bit-brawlers", "orbit-keepers"];
await db.orderItem.deleteMany({ where: { game: { slug: { in: old } } } });
await db.order.deleteMany({ where: { items: { none: {} } } });
await db.game.deleteMany({ where: { slug: { in: old } } });

for (const [slug, name, platform, genre, priceCents, oldPriceCents, stock, , description] of games) {
  const cover = `/games/${slug}/cover.jpg`;
  const hero = `/games/${slug}/hero.jpg`;
  await db.game.upsert({
    where: { slug },
    update: { name, platform, genre, priceCents, oldPriceCents, cover, hero, description },
    create: { slug, name, platform, genre, priceCents, oldPriceCents, stock, cover, hero, description },
  });
}
console.log("Seed ok:", games.length, "jogos");
await db.$disconnect();
