// ============================================================
// Made Across India – Mock Data
// ============================================================

const SELLERS = [
    {
        id: 's1',
        name: 'Meenakshi Silks',
        founder: 'Meenakshi Ramaswamy',
        city: 'Kanchipuram',
        state: 'Tamil Nadu',
        craft: ['Textiles', 'GI-Tagged', 'Meet the Maker'],
        description: 'Four generations of Kanchipuram silk weaving. Every saree takes 10–20 days to hand-weave, with pure zari sourced from Surat.',
        story: [
            {
                headline: 'A loom, a legacy, four generations',
                body: 'In a quiet house in Kanchipuram\'s weavers\' quarter, Meenakshi\'s grandmother taught her every knot. Today, Meenakshi carries this 80-year tradition forward — one silk saree at a time.',
                emoji: '🪡',
                imgPath: 'assets/seller_kanchipuram_weaver.png'
            },
            {
                headline: 'The zari is pure gold',
                body: 'Unlike machine-made sarees, Meenakshi weaves with authentic zari — silver wire coated in 24-carat gold — giving her sarees a weight and sheen that no synthetic can replicate.',
                emoji: '✨',
                imgPath: 'assets/seller_kanchipuram_weaver.png'
            },
            {
                headline: 'GI-Tagged by India\'s government',
                body: 'Kanchipuram silk is one of India\'s most prized GI-tagged crafts, meaning only artisans from this specific region can create and sell genuine Kanchipuram sarees.',
                emoji: '🏆',
                imgPath: 'assets/seller_kanchipuram_weaver.png'
            }
        ],
        products: [
            { name: 'Pure Silk Kanchipuram Saree – Amethyst', price: 8500, mrp: 12000, imgPath: 'assets/product_silk_saree.png', craft: 'Kanchipuram silk. 5.5m, 650g pure silk. Pallu: temple elephant motif with zari.', emoji: '👘', gi: true },
            { name: 'Half-Silk Kanchipuram Saree – Pearl', price: 4200, mrp: 6500, imgPath: null, emoji: '🧣', craft: 'Half-silk blend. Lightweight, ideal for daily wear. Traditional temple border.' },
            { name: 'Silk Blouse Fabric – Azure Gold', price: 1200, mrp: 1800, imgPath: null, emoji: '🎀', craft: 'Matching blouse piece, 1m. Woven to pair with our sarees.' },
            { name: 'Kanchipuram Silk Dupatta', price: 2800, mrp: 4000, imgPath: null, emoji: '🌸', craft: 'Pure silk dupatta with traditional border. 2.5m length.' }
        ],
        verified: true, hasStory: true, isNew: false
    },
    {
        id: 's2',
        name: 'Ranjit Block Printing',
        founder: 'Ranjit Singh Choudhary',
        city: 'Jaipur',
        state: 'Rajasthan',
        craft: ['Textiles', 'Meet the Maker', 'GI-Tagged'],
        description: 'Third-generation block printer from the old city of Jaipur. Ranjit hand-carves his own teak and rosewood blocks, each taking 4–6 weeks to create.',
        story: [
            {
                headline: 'The block that took 6 weeks to carve',
                body: 'Each block Ranjit uses is hand-carved from seasoned teak by craftsmen in the old Jaipur bazaar. Some designs in his collection are over 100 years old — passed down, not copied.',
                emoji: '🪵',
                imgPath: 'assets/seller_jaipur_blockprint.png'
            },
            {
                headline: 'Indigo that won\'t fade',
                body: '\'The secret is in the mordant,\' says Ranjit. Natural dyes fixed with alum and iron give his fabrics the depth and colour-fastness that synthetic dyes can\'t match. His indigo is sourced from Rajasthan\'s own indigofera plants.',
                emoji: '🎨',
                imgPath: 'assets/seller_jaipur_blockprint.png'
            }
        ],
        products: [
            { name: 'Indigo Block-Print Kurta', price: 1450, mrp: 2200, imgPath: 'assets/product_blockprint_kurta.png', craft: 'Hand block-printed on fine cotton. Natural indigo dye. Loose fit, V-neck, 3/4 sleeves.', emoji: '👕', gi: false },
            { name: 'Bagru Print Table Runner Set', price: 880, mrp: 1400, imgPath: null, emoji: '🏮', craft: '2-piece runner set. Traditional Bagru print on cotton. 38 x 180cm each.' },
            { name: 'Sanganeri Print Kurti – Marigold', price: 1100, mrp: 1800, imgPath: null, emoji: '🌼', craft: 'Sanganeri block print in marigold yellow. Fine cotton, knee-length.' },
            { name: 'Block Print Bedsheet Set', price: 2200, mrp: 3200, imgPath: null, emoji: '🛏️', craft: 'King-size bedsheet + 2 pillow covers. Dense hand-printed pattern on cotton percale.' }
        ],
        verified: true, hasStory: true, isNew: false
    },
    {
        id: 's3',
        name: 'Kashmir Pashmina House',
        founder: 'Abdul Rashid Khan',
        city: 'Srinagar',
        state: 'Jammu & Kashmir',
        craft: ['Textiles', 'GI-Tagged', 'Dying Art'],
        description: 'Authentic Pashmina from the high-altitude Changra goats of Ladakh. Each shawl takes 3–6 months to handcraft. GI-tagged and QR-verified.',
        story: [
            {
                headline: 'From the world\'s roof to your hands',
                body: 'Pashmina wool comes only from the Changra goat that grazes at 14,000 feet in Ladakh. At such altitude, the wool develops a fineness — 12–15 microns — finer than the finest cashmere. Abdul\'s family collects and processes every gram by hand.',
                emoji: '🐐',
                imgPath: 'assets/seller_kashmir_pashmina.png'
            },
            {
                headline: 'A dying art form',
                body: 'Fewer than 300 families across Kashmir still practice the ancient Kani weaving technique — where a wooden tool is used instead of a needle. Each Kani shawl contains over a million knots. Abdul is one of the last masters.',
                emoji: '🕯',
                imgPath: 'assets/seller_kashmir_pashmina.png'
            }
        ],
        products: [
            { name: 'Pure Pashmina Shawl – Kashmir Red', price: 12000, mrp: 18000, imgPath: 'assets/product_pashmina_shawl.png', craft: 'Pure Pashmina, 12-micron. Intricate Sozni embroidery by needle. 2m × 1m. Comes with GI tag and QR auth.', emoji: '🧣', gi: true },
            { name: 'Shahtoosh-Mix Wrap – Ivory', price: 6800, mrp: 10500, imgPath: null, emoji: '🤍', craft: 'Pashmina-silk blend wrap. Lightweight, 70×200cm. Perfect for evening wear.' },
            { name: 'Kani-Woven Stole – Multicolor', price: 9500, mrp: 15000, imgPath: null, emoji: '🌈', craft: 'Rare Kani weave technique. 45x200cm. Takes 3 months to weave one piece.' }
        ],
        verified: true, hasStory: true, isNew: false
    },
    {
        id: 's4',
        name: 'Bhuj Bandhani Co.',
        founder: 'Fatima Khatri',
        city: 'Bhuj',
        state: 'Gujarat',
        craft: ['Textiles', 'GI-Tagged', 'Meet the Maker'],
        description: 'The Khatri community of Bhuj has practiced Bandhani for over 500 years. Fatima leads a collective of 18 women artisans, creating tie-dye fabrics that take weeks to tie and dye.',
        story: [
            {
                headline: 'Ten thousand knots in a scarf',
                body: 'Each Bandhani piece begins with a woman pinching tiny dots of fabric and tying them with thread — a process that can take days for a single dupatta. Fatima\'s team of 18 women works in unison, creating geometric patterns passed down orally for 15 generations.',
                emoji: '🔵',
                imgPath: 'assets/seller_gujarat_bandhani.png'
            },
            {
                headline: '18 women, one collective',
                body: 'After the 2001 Gujarat earthquake destroyed Bhuj\'s weaving centres, Fatima helped 18 artisans rebuild. Today, the collective exports to boutiques in Paris and Tokyo — but always, always, the work stays here in Bhuj.',
                emoji: '🤝',
                imgPath: 'assets/seller_gujarat_bandhani.png'
            }
        ],
        products: [
            { name: 'Bandhani Silk Dupatta – Flamingo Pink', price: 2200, mrp: 3200, imgPath: null, emoji: '🩷', craft: 'Hand-tied Bandhani on pure silk. 2.5m. Kumkum pink with white dot pattern. Machine wash cold.' },
            { name: 'Bandhani Cotton Saree – Sunrise', price: 3400, mrp: 5000, imgPath: null, emoji: '🌅', craft: 'Bandhani on fine cotton. Sunrise orange to yellow gradient. 5.5m with running blouse.' },
            { name: 'Gharchola Bridal Dupatta', price: 5800, mrp: 9000, imgPath: null, emoji: '💛', craft: 'Traditional Gharchola — fine silk with Bandhani checks and zari inlay. Used in Gujarati weddings.' }
        ],
        verified: true, hasStory: true, isNew: true
    },
    {
        id: 's5',
        name: 'Mithila Kala Studio',
        founder: 'Savita Devi',
        city: 'Madhubani',
        state: 'Bihar',
        craft: ['Textiles', 'GI-Tagged', 'Dying Art', 'Meet the Maker'],
        description: 'Savita is a National Award-winning Madhubani artist who has adapted the ancient Mithila painting tradition onto fabric — turning wall art into wearable art.',
        story: [
            {
                headline: 'The wall art that became wearable',
                body: 'Madhubani painting was born on the mud walls of Bihar\'s Mithila district — women drew gods, nature, and celebrations on freshly plastered walls. Savita was the first in her village to adapt these patterns onto silk and cotton, creating a new genre: Madhubani fashion.',
                emoji: '🖌️',
                imgPath: 'assets/seller_madhubani_painter.png'
            },
            {
                headline: 'National Award, 2019',
                body: 'The Indian government awarded Savita the National Craft Award for her contribution to preserving and evolving Madhubani art. She now trains 45 women from her district — and every sale directly funds the next generation\'s training.',
                emoji: '🏅',
                imgPath: 'assets/seller_madhubani_painter.png'
            }
        ],
        products: [
            { name: 'Madhubani Hand-Painted Silk Stole', price: 3800, mrp: 5600, imgPath: null, emoji: '🎨', craft: 'Hand-painted using natural pigments on Banarasi silk. Each piece unique. Peacock and lotus motif.' },
            { name: 'Madhubani Cotton Kurti – Fish Motif', price: 2100, mrp: 3000, imgPath: null, emoji: '🐟', craft: 'The fish (maach) is a sacred motif in Mithila — a symbol of good luck and fertility. Knee-length kurti.' },
            { name: 'Madhubani Art Wall Panel (Textile)', price: 4500, mrp: 6500, imgPath: null, emoji: '🖼️', craft: '60×40cm painted fabric panel. Stretched on wooden frame. Bride-and-groom composition.' }
        ],
        verified: true, hasStory: true, isNew: true
    },
    {
        id: 's6',
        name: 'Sundarbans Kantha Weave',
        founder: 'Purnima Mondal',
        city: 'Bolpur',
        state: 'West Bengal',
        craft: ['Textiles', 'Meet the Maker', 'Freshly Onboarded'],
        description: 'Kantha is one of Bengal\'s oldest embroidery traditions — layers of old saris stitched together with running thread. Purnima runs a cooperative of 30 rural women in Bolpur.',
        story: [
            {
                headline: 'New life from old sarees',
                body: 'Kantha began as necessity — layers of worn-out saris stitched together against the winter chill. Today, Purnima\'s cooperative transforms discarded fabric into premium reversible quilts and throws that travel to buyers worldwide.',
                emoji: '🧵',
                imgPath: null
            }
        ],
        products: [
            { name: 'Kantha Double-Sided Quilt – Bengal Crimson', price: 3200, mrp: 4800, imgPath: null, emoji: '🛏️', craft: 'Handstitched Kantha quilt. Red-white reversible. 240×260cm. 100% upcycled cotton.' },
            { name: 'Kantha Embroidered Shoulder Bag', price: 1400, mrp: 2100, imgPath: null, emoji: '👜', craft: 'Hand-kantha embroidered tote. Inner cotton lining, 2 pockets. Birds-and-forest pattern.' },
            { name: 'Kantha Silk Running Stole', price: 1800, mrp: 2600, imgPath: null, emoji: '🧣', craft: 'Kantha running stitch on mulberry silk. 30 hours of stitching per piece.' }
        ],
        verified: true, hasStory: true, isNew: true
    },
    {
        id: 's7',
        name: 'Assam Eri Silk Weavers',
        founder: 'Dipanjali Borah',
        city: 'Sualkuchi',
        state: 'Assam',
        craft: ['Textiles', 'GI-Tagged', 'Dying Art'],
        description: 'Sualkuchi is called the Manchester of Assam. Dipanjali leads a cooperative of weavers producing Eri and Muga silk — two of the rarest silks in the world, found only in Assam.',
        story: [
            {
                headline: 'The silk only Assam can make',
                body: 'Muga silk — the golden silk of Assam — is produced by a silkworm that feeds only on specific Assamese plants. This silk cannot be farmed anywhere else on Earth. Dipanjali\'s cooperative produces 100% natural Muga and Eri silk on hundred-year-old looms.',
                emoji: '🌿',
                imgPath: null
            }
        ],
        products: [
            { name: 'Muga Silk Mekhela Sador', price: 7500, mrp: 11000, imgPath: null, emoji: '✨', craft: 'Traditional Assamese 2-piece dress. Pure Muga silk. Natural golden sheen. GI-tagged.' },
            { name: 'Eri Silk Shawl – Natural', price: 4200, mrp: 6200, imgPath: null, emoji: '🧣', craft: 'Eri silk (peace silk — no silkworm harmed). Off-white, natural fibre. Extra warm.' }
        ],
        verified: true, hasStory: true, isNew: false
    },
    {
        id: 's8',
        name: 'Andhra Kalamkari Arts',
        founder: 'Venkata Rama Rao',
        city: 'Srikalahasti',
        state: 'Andhra Pradesh',
        craft: ['Textiles', 'GI-Tagged', 'Meet the Maker'],
        description: 'Kalamkari — pen-on-cloth — is a 3,000-year-old art form. Venkata uses a bamboo pen dipped in fermented iron-jaggery solution to draw epic mythological narratives on cotton.',
        story: [
            {
                headline: 'Drawing the Mahabharata with a pen',
                body: 'Kalamkari takes its name from \'kalam\' (pen) and \'kari\' (work). Venkata hand-draws every line using a tamarind pen dipped in natural dye — a single saree can take 40+ hours to complete, depicting scenes from the Ramayana.',
                emoji: '🖋️',
                imgPath: null
            }
        ],
        products: [
            { name: 'Kalamkari Cotton Saree – Ramayana Series', price: 5200, mrp: 7800, imgPath: null, emoji: '📜', craft: 'Hand-drawn Srikalahasti style. Depicts Ram-Sita scenes. Natural dyes. 5.5m.' },
            { name: 'Kalamkari Silk Dupatta', price: 2800, mrp: 4200, imgPath: null, emoji: '🌺', craft: 'Kalamkari on silk. Floral-peacock composition. 2.5m.' }
        ],
        verified: true, hasStory: true, isNew: false
    },
    {
        id: 's9',
        name: 'Rajasthan Pottery Guild',
        founder: 'Mohan Kumawat',
        city: 'Jaipur',
        state: 'Rajasthan',
        craft: ['Pottery', 'GI-Tagged', 'Dying Art'],
        description: 'Blue Pottery of Jaipur is unique in the world — it uses no clay. It is made from quartz, rock glass, and Multani mitti, giving it a distinctive translucent quality.',
        story: [
            {
                headline: 'Pottery without clay',
                body: 'Jaipur Blue Pottery is technically not pottery at all — it uses powdered quartz, not clay. Mohan\'s family has practised this Mughal-era technique for five generations. Today, fewer than 50 craftsmen in Jaipur still know the original formulation.',
                emoji: '🏺',
                imgPath: null
            }
        ],
        products: [
            { name: 'Blue Pottery Chai Set – Floral', price: 1800, mrp: 2600, imgPath: null, emoji: '🫖', craft: '4 cups + 1 teapot. Jaipur Blue Pottery. Quartz-based, food-safe. Floral motif.' },
            { name: 'Blue Pottery Vase – Peacock', price: 1200, mrp: 1800, imgPath: null, emoji: '🏺', craft: 'Medium vase, 25cm. Hand-painted peacock motif in cobalt and turquoise.' }
        ],
        verified: true, hasStory: true, isNew: false
    },
    {
        id: 's10',
        name: 'Kashmir Copper Craft',
        founder: 'Bashir Ahmad',
        city: 'Srinagar',
        state: 'Jammu & Kashmir',
        craft: ['Woodwork', 'Freshly Onboarded'],
        description: 'Kashmiri copper and walnut wood crafts — hand-engraved trays and boxes using the 700-year-old Naqqashi tradition. No two pieces are the same.',
        story: [
            {
                headline: '700 years of Naqqashi',
                body: 'Naqqashi is the art of hand-engraving — copper, silver, and wood — using tiny chisels. Bashir learned by watching his father for 8 years before picking up a chisel himself. Each piece takes days of patient, intricate work.',
                emoji: '🔨',
                imgPath: null
            }
        ],
        products: [
            { name: 'Walnut Wood Jewellery Box – Engraved', price: 3200, mrp: 4800, imgPath: null, emoji: '📦', craft: 'Carved walnut wood. Hand-engraved Naqqashi on lid. Velvet interior, brass clasp.' },
            { name: 'Copper Serving Tray – Chinar Leaf', price: 2400, mrp: 3500, imgPath: null, emoji: '🍂', craft: 'Hand-engraved copper tray. 40cm diameter. Chinar (maple) leaf motif — Kashmir\'s iconic symbol.' }
        ],
        verified: true, hasStory: true, isNew: true
    },
    {
        id: 's11',
        name: 'Kutch Embroidery Collective',
        founder: 'Hajra Sumra',
        city: 'Anjar',
        state: 'Gujarat',
        craft: ['Textiles', 'Meet the Maker', 'Freshly Onboarded'],
        description: 'Kutch has one of India\'s richest embroidery traditions — Hajara and her collective practice Suf, Rabari, and Ahir styles, each distinct in stitch and story.',
        story: [],
        products: [
            { name: 'Kutch Embroidered Tote – Rabari', price: 1600, mrp: 2400, imgPath: null, emoji: '👜', craft: 'Hand-embroidered Rabari stitch. Mirrors, chain stitch, and geometric fill. Canvas base.' },
            { name: 'Kutch Cushion Cover Set – Ahir', price: 1200, mrp: 1800, imgPath: null, emoji: '🛋️', craft: '2 cushion covers. Ahir embroidery in bold geometric patterns. 45×45cm.' }
        ],
        verified: true, hasStory: false, isNew: true
    },
    {
        id: 's12',
        name: 'Odisha Sambalpuri Handloom',
        founder: 'Padmavathi Meher',
        city: 'Sambalpur',
        state: 'Odisha',
        craft: ['Textiles', 'GI-Tagged'],
        description: 'Sambalpuri is Odisha\'s signature ikat — where the yarn is dyed before weaving, creating the characteristic feathered pattern. GI-tagged, handwoven on traditional pit looms.',
        story: [],
        products: [
            { name: 'Sambalpuri Ikat Cotton Saree', price: 4200, mrp: 6200, imgPath: null, emoji: '🌊', craft: 'Double ikat cotton. Shankha-chakra motif (conch and wheel). 5.5m. GI-tagged.' },
            { name: 'Sambalpuri Silk Saree – Premium', price: 8500, mrp: 13000, imgPath: null, emoji: '✨', craft: 'Pure silk double ikat. Takes 2 weeks to produce. Temple border.' }
        ],
        verified: true, hasStory: false, isNew: false
    }
];

// Group sellers by state
const SELLERS_BY_STATE = {};
SELLERS.forEach(s => {
    if (!SELLERS_BY_STATE[s.state]) SELLERS_BY_STATE[s.state] = [];
    SELLERS_BY_STATE[s.state].push(s);
});

// State → path ID mapping
const STATE_PATH_MAP = {
    'Andaman and Nicobar Islands': 'state-an',
    'Andhra Pradesh': 'state-ap',
    'Arunachal Pradesh': 'state-ar',
    'Assam': 'state-as',
    'Bihar': 'state-br',
    'Chandigarh': 'state-ch',
    'Chhattisgarh': 'state-ct',
    'Dadra and Nagar Haveli': 'state-dn',
    'Daman and Diu': 'state-dd',
    'Delhi': 'state-dl',
    'Goa': 'state-ga',
    'Gujarat': 'state-gj',
    'Haryana': 'state-hr',
    'Himachal Pradesh': 'state-hp',
    'Jammu & Kashmir': 'state-jk',
    'Jammu and Kashmir': 'state-jk',
    'Jharkhand': 'state-jh',
    'Karnataka': 'state-ka',
    'Kerala': 'state-kl',
    'Lakshadweep': 'state-ld',
    'Madhya Pradesh': 'state-mp',
    'Maharashtra': 'state-mh',
    'Manipur': 'state-mn',
    'Meghalaya': 'state-ml',
    'Mizoram': 'state-mz',
    'Nagaland': 'state-nl',
    'Odisha': 'state-od',
    'Puducherry': 'state-py',
    'Punjab': 'state-pb',
    'Rajasthan': 'state-rj',
    'Sikkim': 'state-sk',
    'Tamil Nadu': 'state-tn',
    'Telangana': 'state-tg',
    'Tripura': 'state-tr',
    'Uttar Pradesh': 'state-up',
    'Uttarakhand': 'state-ut',
    'West Bengal': 'state-wb',
};
