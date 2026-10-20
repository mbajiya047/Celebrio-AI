// Pre-loaded Showcase Events for Celebrio AI
const SAMPLE_EVENTS = [
  {
    id: "sample_wedding_01",
    summary: {
      title: "Seraphina & Liam's Tuscan Vineyard Wedding",
      tagline: "Under the Golden Italian Sun: An Intimate Wine Country Celebration",
      eventType: "wedding",
      eventDate: "2026-09-18",
      guestCount: 110,
      budgetTotal: 38000,
      currency: "$",
      location: "Villa Bella Vista, Sonoma Valley",
      aesthetic: "Tuscan Rustic Elegance & Warm Sunset Romance",
      keyVision: "An enchanting open-air dining experience surrounded by olive trees and rolling vineyards, bathed in amber bistro lighting with artisanal local farm-to-table cuisine, acoustic guitar strings, and heartfelt family traditions."
    },
    theme: {
      conceptName: "Tuscan Terracotta & Olive Grove",
      description: "Earthy warmth meets sophisticated romance. Raw stoneware plates, organic olive branches, flickering pillar candles in glass hurricane lanterns, warm terra-cotta clay tones, and sun-drenched neutral linens.",
      colorPalette: [
        { name: "Terracotta Clay", hex: "#C86D51", usage: "Table linens, envelope liners, and accent florals" },
        { name: "Olive Leaf", hex: "#556B2F", usage: "Garlands, bridal bouquet foliage, and stationery wax seals" },
        { name: "Champagne Glow", hex: "#F7E7CE", usage: "Base linens, bridesmaid gowns, and drapery" },
        { name: "Aged Walnut", hex: "#4A3525", usage: "Crossback wooden chairs and rustic vineyard banquet tables" },
        { name: "Dusty Gold", hex: "#D4AF37", usage: "Cutlery, rimmed glassware, and calligraphed place cards" }
      ],
      decorHighlights: [
        "100-foot communal wooden farm tables adorned with cascading olive leaf and eucalyptus garlands",
        "Overhead canopy of warm incandescent bistro string lights entwined with grapevine foliage",
        "Custom rustic wooden bar station made from repurposed vintage wine barrels",
        "Handmade calligraphy terracotta tile place cards that double as guest keepsake gifts"
      ],
      signatureDrink: {
        name: "The Sonoma Sunset Spritz",
        recipe: "Aperol, artisanal blood orange puree, crisp Prosecco, sparkling soda, and a sprig of fresh rosemary picked from the vineyard garden.",
        mocktailAlternative: "San Pellegrino Aranciata Rossa with fresh thyme, muddled blackberries, and a splash of pomegranate juice."
      },
      musicVibe: "Acoustic nylon string classical guitar during the ceremony, vintage Italian jazz quartet during aperitivo, and high-energy live brass band under the stars."
    },
    budget: {
      total: 38000,
      categories: [
        {
          id: "venue",
          name: "Venue & Estate Rental",
          allocated: 11000,
          spent: 11000,
          percentage: 29,
          notes: "Private estate access for 2 full days, bridal suite, ceremony lawn & barrel cellar.",
          savingTip: "Hosting on a Friday or Sunday saved $2,500 compared to Saturday peak rates."
        },
        {
          id: "catering",
          name: "Artisanal Catering & Vineyard Wine",
          allocated: 12500,
          spent: 12100,
          percentage: 33,
          notes: "4-course plated Tuscan feast with estate wine pairing and late-night woodfired pizza truck.",
          savingTip: "Purchased estate wines by the case directly through venue club allocation for a 20% discount."
        },
        {
          id: "decor",
          name: "Florals & Ambience Lighting",
          allocated: 4500,
          spent: 4200,
          percentage: 12,
          notes: "Abundant olive branch runners, locally grown garden roses, and overhead festoon lighting.",
          savingTip: "Prioritized abundant greenery and seasonal local foliage over imported off-season blooms."
        },
        {
          id: "photo_video",
          name: "Fine Art Photography & Super 8 Film",
          allocated: 4200,
          spent: 4200,
          percentage: 11,
          notes: "Full 8-hour documentary coverage plus vintage Super-8 highlights reel and drone aerials.",
          savingTip: "Selected a regional photographer whose home base eliminates flight and multi-night lodging stipends."
        },
        {
          id: "entertainment",
          name: "Acoustic Duo & Live Brass Band",
          allocated: 2800,
          spent: 2500,
          percentage: 7,
          notes: "Ceremony strings, cocktail jazz trio, and 5-piece evening dance band.",
          savingTip: "Booked a versatile group that provides both cocktail hour acoustics and dance reception entertainment."
        },
        {
          id: "stationery",
          name: "Letterpress Stationery & Signage",
          allocated: 1000,
          spent: 950,
          percentage: 3,
          notes: "Cotton paper invites with custom watercolor estate map and calligraphy seating chart.",
          savingTip: "Created digital RSVPs via custom QR code on the back of details card to slash return postage."
        },
        {
          id: "attire_favors",
          name: "Favors & Artisan Olive Oil",
          allocated: 1000,
          spent: 850,
          percentage: 3,
          notes: "Individual mini estate-bottled extra virgin olive oil with personalized calligraphy neck tags.",
          savingTip: "Bottled and labeled the estate olive oil in bulk with wedding party during rehearsal weekend."
        },
        {
          id: "emergency",
          name: "Contingency & Tip Reserve",
          allocated: 1000,
          spent: 300,
          percentage: 2,
          notes: "Buffer for on-the-day staff gratuities, unexpected delivery weather tarps, and ice.",
          savingTip: "Kept in high-yield account until 48 hours prior to final payout."
        }
      ]
    },
    timelineMilestones: [
      {
        id: "m1",
        timeframe: "10-12 Months Before",
        phase: "Estate & Date Confirmation",
        task: "Execute contract for Villa Bella Vista and lock in ceremony coordinator.",
        priority: "High",
        done: true
      },
      {
        id: "m2",
        timeframe: "8-9 Months Before",
        phase: "Catering & Visuals",
        task: "Attend private menu tasting and confirm fine-art photo/video team contract.",
        priority: "High",
        done: true
      },
      {
        id: "m3",
        timeframe: "5-6 Months Before",
        phase: "Design & Attire",
        task: "Finalize terracotta floral samples, order bridal gown and tailored linen suit.",
        priority: "Medium",
        done: true
      },
      {
        id: "m4",
        timeframe: "2-3 Months Before",
        phase: "Invitations & RSVPs",
        task: "Mail letterpress invitations with Sonoma travel guide and monitor guest dietary notes.",
        priority: "High",
        done: true
      },
      {
        id: "m5",
        timeframe: "3-4 Weeks Before",
        phase: "Run of Show & Seating",
        task: "Finalize master run-of-show with lead coordinator and confirm vineyard shuttle schedule.",
        priority: "High",
        done: false
      },
      {
        id: "m6",
        timeframe: "48 Hours Before",
        phase: "Rehearsal & Welcome",
        task: "Host rehearsal walk-through at ceremony lawn followed by vineyard welcome dinner.",
        priority: "Medium",
        done: false
      }
    ],
    runOfShow: [
      {
        time: "10:30 AM",
        activity: "Bridal Party & Groom Suite prep begins",
        lead: "Lead Stylist & Maid of Honor",
        location: "Villa Bella Vista Private Suite",
        notes: "Mimosas, fresh fruit skewers, and hair/makeup rotation."
      },
      {
        time: "01:30 PM",
        activity: "Vendor load-in & Floral arbor installation",
        lead: "Event Coordinator & Floral Team",
        location: "Ceremony Lawn & Pergola",
        notes: "Ensure olive branches are misted to withstand late afternoon sun."
      },
      {
        time: "03:15 PM",
        activity: "First Look & Couple's Private Portraits",
        lead: "Lead Photographer",
        location: "Historic Cypress Tree Path",
        notes: "30 minutes undisturbed golden hour lighting before guests arrive."
      },
      {
        time: "04:30 PM",
        activity: "Guest Arrival & Pre-Ceremony Infused Water Bar",
        lead: "Hospitality Host",
        location: "Olive Grove Courtyard",
        notes: "Rosemary citrus water and sparkling peach iced tea served upon coach arrival."
      },
      {
        time: "05:00 PM",
        activity: "Wedding Ceremony: Processional & Vows Exchange",
        lead: "Officiant & Acoustic Duo",
        location: "Vineyard Lawn",
        notes: "Microphones checked, unamplified acoustic guitar background."
      },
      {
        time: "05:45 PM",
        activity: "Aperitivo & Cocktail Hour under Bistro Lights",
        lead: "Catering Captain",
        location: "The Barrel Terrace",
        notes: "Passed arancini, Sonoma Sunset Spritz, and live jazz trio."
      },
      {
        time: "07:00 PM",
        activity: "Grand Entrance & Plated Tuscan Dinner",
        lead: "MC & Banquet Lead",
        location: "Long Vineyard Banquet Tables",
        notes: "Wine pairings poured table-side; welcome toast by Father of the Bride."
      },
      {
        time: "08:45 PM",
        activity: "First Dance, Cake Cutting & Gelato Cart Unveiling",
        lead: "Band Leader",
        location: "Paved Courtyard Dance Floor",
        notes: "Pistachio and blood orange gelato served alongside rustic tiered olive oil cake."
      },
      {
        time: "11:00 PM",
        activity: "Sparkler Send-off & Guest Shuttles Depart",
        lead: "Coordinator & Shuttle Driver",
        location: "Main Villa Driveway",
        notes: "Late night woodfired pizza slices boxed for shuttle ride back to town."
      }
    ],
    vendors: [
      {
        id: "v1",
        category: "Venue",
        name: "Villa Bella Vista Estate",
        role: "Estate Director & Venue Host",
        estimatedCost: 11000,
        actualCost: 11000,
        status: "Contracted",
        contact: "events@villabellavista-sonoma.com",
        keyQuestions: "What is the noise curfew (11:00 PM confirmed) and load-out window the next morning?",
        priority: "Critical"
      },
      {
        id: "v2",
        category: "Catering",
        name: "Tuscan Hearth Sonoma",
        role: "Executive Banquet Chef",
        estimatedCost: 12500,
        actualCost: 12100,
        status: "Contracted",
        contact: "chef.marco@tuscanhearth.com",
        keyQuestions: "Can gluten-free homemade tagliatelle be prepared for 8 specific guests?",
        priority: "Critical"
      },
      {
        id: "v3",
        category: "Photography",
        name: "Lumina fine art studios",
        role: "Lead Photographer & Super 8 Cinematographer",
        estimatedCost: 4200,
        actualCost: 4200,
        status: "Contracted",
        contact: "hello@luminastudios.com",
        keyQuestions: "Confirm timeline for golden hour portrait sequence and drone airspace clearance.",
        priority: "High"
      },
      {
        id: "v4",
        category: "Floral & Decor",
        name: "Botanica Grove",
        role: "Lead Florist & Stylist",
        estimatedCost: 4500,
        actualCost: 4200,
        status: "Contracted",
        contact: "claire@botanicagrove.com",
        keyQuestions: "Will olive branches be sourced directly from Northern California growers?",
        priority: "High"
      },
      {
        id: "v5",
        category: "Entertainment",
        name: "Sonoma Strings & Brass Collective",
        role: "Musical Director",
        estimatedCost: 2800,
        actualCost: 2500,
        status: "Contracted",
        contact: "booking@sonomabrass.com",
        keyQuestions: "Confirm learning special arrangement for First Dance ('La Vie En Rose' instrumental).",
        priority: "Medium"
      }
    ],
    personalizedIdeas: {
      signatureActivities: [
        {
          title: "Anniversary Wine Capsule Guestbook",
          description: "Guests write advice notes and slip them into personalized wooden wine boxes marked for Liam & Seraphina's 1st, 5th, 10th, and 25th anniversaries, accompanied by aged vineyard vintages.",
          supplies: "Custom engraved 4-bottle wooden box, parchment scrolls, wax sealing pens"
        },
        {
          title: "Late-Night Gelato & Espresso Cart",
          description: "Surprise mobile vintage cart rolling onto the terrace at 9:30 PM offering affogatos and handcrafted Italian gelato flavors.",
          supplies: "Cart rental, authentic espresso machine, waffle cones, paper cups"
        },
        {
          title: "Artisanal Olive Oil Blending Station",
          description: "During cocktail hour, guests can infuse their own take-home bottle of Sonoma olive oil with fresh herbs (rosemary, chili flakes, roasted garlic, cracked pepper).",
          supplies: "Glass cruets, fresh herb sprigs, custom cork stoppers, instruction cards"
        }
      ],
      invitationCopy: {
        headline: "TOGETHER UNDER THE SUN AND STARS",
        opening: "With joyous hearts, Seraphina Vance and Liam Sterling invite you to celebrate their union.",
        details: "Friday, September 18th, 2026 at half past four o'clock in the afternoon. Villa Bella Vista, Sonoma, California. Dinner, dancing, and wine to follow under the evening sky.",
        rsvpNote: "Kindly respond by August 1st via our private celebration portal at seraphinaandliam.love",
        dressCodeAdvice: "Wine Country Cocktail Attire. Earth tones, breezy linens, and comfortable footwear for lawn strolls welcomed."
      },
      guestExperienceTouch: "Hand-poured travel candles scented with fig and olive branch waiting in each hotel welcome basket."
    }
  },
  {
    id: "sample_birthday_02",
    summary: {
      title: "Leo's 30th Neon Synthwave Arcade Bash",
      tagline: "Player 30 Has Entered The Game: Retro Cabinets & Cyber Vibes",
      eventType: "birthday",
      eventDate: "2026-11-14",
      guestCount: 50,
      budgetTotal: 5500,
      currency: "$",
      location: "Gridiron Loft & Arcade, Austin",
      aesthetic: "80s Cyberpunk Synthwave & Glowing Retro Nostalgia",
      keyVision: "A neon-saturated milestone 30th birthday featuring authentic vintage upright arcade cabinets, glowing UV cocktails, an epic high-score tournament, synthwave DJ sets, and gourmet retro diner sliders."
    },
    theme: {
      conceptName: "Electric Grid 1986",
      description: "Dark ambient loft illuminated by blazing magenta and electric cyan neon lines, reflective grid floors, CRT television stacks running vintage loops, and pixel-art custom accents.",
      colorPalette: [
        { name: "Laser Magenta", hex: "#FF007F", usage: "Neon signage, cocktail garnish glows, and wristbands" },
        { name: "Electric Cyan", hex: "#00F0FF", usage: "Cabinet accent lighting, drink ice cubes, and stickers" },
        { name: "Synthwave Purple", hex: "#2E0854", usage: "Ambient room wash lighting and custom table covers" },
        { name: "Arcade Coin Gold", hex: "#FFD700", usage: "Custom stamped tokens and tournament winner trophies" },
        { name: "Grid Carbon", hex: "#12121A", usage: "Base loft decor and wireframe backdrops" }
      ],
      decorHighlights: [
        "Giant LED neon sign reading 'LEVEL 30 UNLOCKED' mounted over the DJ booth",
        "Stack of 8 vintage CRT monitors playing looped 80s anime and retro gameplay reels",
        "Glowing blacklight-reactive grid tape running across the dance floor and bar facade",
        "Custom arcade token punch cards given to guests at the door"
      ],
      signatureDrink: {
        name: "The 1-Up Electric Elixir",
        recipe: "White rum, blue curaçao, fresh lime juice, coconut cream, and glowing UV tonic ice cubes that shine bright cyan under blacklight.",
        mocktailAlternative: "Sparkling lemonade with blue butterfly pea flower tea and popping boba pearls."
      },
      musicVibe: "Mitch Murder, Kavinsky, The Midnight, classic Chiptune remixes, and energetic 80s dance pop."
    },
    budget: {
      total: 5500,
      categories: [
        {
          id: "venue",
          name: "Loft Venue & Arcade Cabinets",
          allocated: 1600,
          spent: 1600,
          percentage: 29,
          notes: "Private 6-hour loft rental with 4 operational arcade cabinets (Pac-Man, Street Fighter II, Galaga).",
          savingTip: "Booked a warehouse loft through Peerspace on an off-peak Thursday/Friday window."
        },
        {
          id: "catering",
          name: "Retro Diner Bar & Cocktails",
          allocated: 1800,
          spent: 1720,
          percentage: 33,
          notes: "Gourmet smash burger sliders, crinkle truffle fries bar, and curated neon cocktails.",
          savingTip: "Self-purchased wholesale liquor and hired a licensed freelance mixologist friend."
        },
        {
          id: "decor",
          name: "Neon Signage & UV Lighting",
          allocated: 650,
          spent: 600,
          percentage: 12,
          notes: "Rented 4 commercial blacklight cannons and commissioned a reusable custom LED neon sign.",
          savingTip: "Rented UV lighting fixtures from a local student theatrical group for 60% less."
        },
        {
          id: "photo_video",
          name: "Retro VHS & Instant Camera Booth",
          allocated: 450,
          spent: 420,
          percentage: 8,
          notes: "Digital photographer roaming with vintage VHS camcorder and dual instant camera printer.",
          savingTip: "Set up guest instant photo guestbook with mini photo tape."
        },
        {
          id: "entertainment",
          name: "Synthwave DJ & Tournament Emcee",
          allocated: 500,
          spent: 500,
          percentage: 9,
          notes: "Live 3-hour DJ set and high-score tournament referee.",
          savingTip: "Provided full playlist guide and pre-set track transitions."
        },
        {
          id: "attire_favors",
          name: "Custom Brass Tokens & Pixel Cookies",
          allocated: 300,
          spent: 280,
          percentage: 5,
          notes: "Personalized stamped brass tokens in velvet pouches and 8-bit frosted sugar cookies.",
          savingTip: "Ordered tokens in bulk online 6 weeks ahead to avoid express minting fees."
        },
        {
          id: "emergency",
          name: "Contingency & Ice Reserve",
          allocated: 200,
          spent: 50,
          percentage: 4,
          notes: "Emergency ice, power surge protector cords, and clean-up buffer.",
          savingTip: "Remaining funds rolled into Leo's next bucket-list trip."
        }
      ]
    },
    timelineMilestones: [
      {
        id: "m1",
        timeframe: "8 Weeks Before",
        phase: "Venue & Arcade Reservation",
        task: "Lock in Gridiron Loft deposit and confirm electrical specs for arcade machines.",
        priority: "High",
        done: true
      },
      {
        id: "m2",
        timeframe: "5 Weeks Before",
        phase: "Menu & Neon Orders",
        task: "Design custom neon 'Level 30' sign and finalize slider bar menu.",
        priority: "High",
        done: true
      },
      {
        id: "m3",
        timeframe: "3 Weeks Before",
        phase: "Digital Invitations",
        task: "Send animated pixel-art invitations with tournament registration link.",
        priority: "Medium",
        done: true
      },
      {
        id: "m4",
        timeframe: "1 Week Before",
        phase: "Token Minting & Playlist",
        task: "Pick up custom arcade tokens and review DJ high-energy entrance track.",
        priority: "Medium",
        done: true
      },
      {
        id: "m5",
        timeframe: "Day of Event",
        phase: "Arcade Load-in & Party",
        task: "Test machine coin mechanisms, chill glowing cocktails, and welcome guests.",
        priority: "High",
        done: false
      }
    ],
    runOfShow: [
      {
        time: "05:00 PM",
        activity: "Loft Access & Arcade Tech Setup",
        lead: "Host & Rental Crew",
        location: "Main Arcade Area",
        notes: "Calibrate free-play switches on Pac-Man and Street Fighter."
      },
      {
        time: "06:30 PM",
        activity: "Lighting Check & Blacklight Warm-up",
        lead: "Decor Lead",
        location: "Loft Floor",
        notes: "Power on UV floodlights, CRT video walls, and glowing ice stations."
      },
      {
        time: "07:30 PM",
        activity: "Doors Open & Token Distribution",
        lead: "Welcome Host",
        location: "Check-in Desk",
        notes: "Give every guest a velvet pouch with 5 custom 'LEO 30' brass tokens."
      },
      {
        time: "08:15 PM",
        activity: "Gourmet Slider Bar & Craft Cocktails Open",
        lead: "Bar Team",
        location: "Retro Diner Bar",
        notes: "Serve High Score Sliders and glowing cyan signature elixirs."
      },
      {
        time: "09:15 PM",
        activity: "The Great Street Fighter II Bracket Finals",
        lead: "DJ & Host",
        location: "Center Arcade Stage",
        notes: "Project gameplay onto central loft wall; winner awarded gold joystick trophy."
      },
      {
        time: "10:15 PM",
        activity: "Level 30 Cake Cut & Midnight Cyber Toast",
        lead: "Leo & Friends",
        location: "Main Lounge",
        notes: "8-bit Pac-Man cake with sparkler candles and retro synthwave anthem."
      },
      {
        time: "12:00 AM",
        activity: "Last Round & High Score Leaderboard Photos",
        lead: "Event Host",
        location: "Loft Entrance",
        notes: "Polaroid group shots placed on magnetic leaderboard wall."
      }
    ],
    vendors: [
      {
        id: "v1",
        category: "Venue",
        name: "Gridiron Loft Studios",
        role: "Venue Manager",
        estimatedCost: 1600,
        actualCost: 1600,
        status: "Contracted",
        contact: "manager@gridironloft.com",
        keyQuestions: "Verify maximum electrical circuit capacity for 4 arcade cabinets simultaneously.",
        priority: "Critical"
      },
      {
        id: "v2",
        category: "Catering",
        name: "Atomic Sliders Co.",
        role: "Mobile Kitchen Lead",
        estimatedCost: 1800,
        actualCost: 1720,
        status: "Contracted",
        contact: "orders@atomicsliders.com",
        keyQuestions: "Can vegetarian jackfruit sliders be clearly marked with glowing toothpicks?",
        priority: "High"
      },
      {
        id: "v3",
        category: "Arcade Rentals",
        name: "Nostalgia Arcade Vault",
        role: "Technician & Delivery",
        estimatedCost: 650,
        actualCost: 600,
        status: "Contracted",
        contact: "delivery@arcadevault.com",
        keyQuestions: "Confirm free-play mode and spare fuse kit included.",
        priority: "High"
      }
    ],
    personalizedIdeas: {
      signatureActivities: [
        {
          title: "The Ultimate Street Fighter Bracket Tournament",
          description: "16-player single-elimination tournament projected onto the warehouse brick wall with live hype-man commentary by the DJ.",
          supplies: "Projector, bracket dry-erase board, arcade sticks, engraved gold joystick trophy"
        },
        {
          title: "VHS Camcorder Guestbook Station",
          description: "Guests grab an authentic 1989 Panasonic VHS shoulder camera and record 30-second birthday roasts and congratulations tapes.",
          supplies: "Working vintage VHS camera, tape adapters, neon studio light"
        }
      ],
      invitationCopy: {
        headline: "INSERT COIN TO CONTINUE // LEVEL 30",
        opening: "Three decades in the making. Leo is powering up to Level 30 and the high score is up for grabs.",
        details: "Saturday, November 14th, 2026. 7:30 PM until game over. Gridiron Loft, Austin, TX. Unlimited vintage arcade play, synthwave rhythms, diner eats, and glowing libations.",
        rsvpNote: "Claim your extra life by October 25th at leo-level30.party",
        dressCodeAdvice: "80s Cyberpunk, Retro Gamer, Neon Casual, or Vintage Synthwave chic."
      },
      guestExperienceTouch: "Custom arcade token keychains for everyone to take home as eternal keepsakes."
    }
  },
  {
    id: "sample_community_03",
    summary: {
      title: "Oakridge Harvest & Heritage Community Festival",
      tagline: "Celebrating Local Artisans, Sustainable Agriculture & Neighborhood Harmony",
      eventType: "community",
      eventDate: "2026-10-10",
      guestCount: 350,
      budgetTotal: 22000,
      currency: "$",
      location: "Oakridge Centennial Park & Pavilion",
      aesthetic: "Warm Autumn Heritage, Rustic Wood, and Golden Maple",
      keyVision: "A welcoming, family-friendly all-day community celebration uniting 300+ neighbors for farm-to-table food trucks, local acoustic music on the gazebo stage, an artisanal maker's market, and a charity silent auction supporting the community greenhouse."
    },
    theme: {
      conceptName: "Golden Harvest & Community Roots",
      description: "Crisp autumn foliage, rustic cedar wood benches, amber harvest lanterns, hay bale lounge circles, and burlap bunting celebrating neighborhood heritage and sustainability.",
      colorPalette: [
        { name: "Spiced Pumpkin", hex: "#D35400", usage: "Market signage, banners, and festival brochures" },
        { name: "Forest Cedar", hex: "#1E4D2B", usage: "Volunteer aprons, park flags, and eco-stations" },
        { name: "Harvest Gold", hex: "#F39C12", usage: "Lantern lighting, stage backdrop, and prize ribbons" },
        { name: "Warm Burlap", hex: "#D7B584", usage: "Table coverings and hay bale wrap" },
        { name: "Crimson Maple", hex: "#922B21", usage: "Accent florals and community mural board" }
      ],
      decorHighlights: [
        "100 hay bales arranged into cozy semi-circle seating amphitheaters around the acoustic gazebo",
        "Community Handprint Harvest Tree mural where every attendee stamps a painted leaf",
        "Solar-powered warm amber fairy light tunnels over the central pedestrian pathway",
        "Chalkboard artisan vendor directory highlighting 25 neighborhood small businesses"
      ],
      signatureDrink: {
        name: "Oakridge Spiced Honey Cider",
        recipe: "Locally pressed orchard apple cider simmered with cinnamon quills, whole cloves, star anise, and fresh orange zest.",
        mocktailAlternative: "Sparkling cranberry apple spritzer with fresh rosemary garnish."
      },
      musicVibe: "Local bluegrass bands, acoustic folk singers, youth choir showcase, and community percussion circle."
    },
    budget: {
      total: 22000,
      categories: [
        {
          id: "venue",
          name: "Park Permits, Pavilion & City Sanitation",
          allocated: 3500,
          spent: 3500,
          percentage: 16,
          notes: "Municipal park rental permit, sound ordinance approval, security liaison, and compost/recycling dumpsters.",
          savingTip: "Secured municipal non-profit municipal fee waiver for community development initiatives."
        },
        {
          id: "catering",
          name: "Food Truck Logistics & Hospitality",
          allocated: 4500,
          spent: 4200,
          percentage: 20,
          notes: "Power generators for 5 local food trucks, community cider tasting booth, and volunteer meals.",
          savingTip: "Food trucks contributed a 10% rev-share donation directly to the festival charity fund."
        },
        {
          id: "decor",
          name: "Hay Bales, Signage & Ambient Lighting",
          allocated: 3200,
          spent: 3000,
          percentage: 15,
          notes: "Local farm hay bale rental, reusable wooden route signs, and solar lantern strings.",
          savingTip: "Hay bales returned to donor farm for compost after festival conclusion."
        },
        {
          id: "entertainment",
          name: "Gazebo Sound System & Artist Honorariums",
          allocated: 3800,
          spent: 3600,
          percentage: 17,
          notes: "PA audio rental, sound engineer for 8 hours, and modest honorariums for 6 local musical acts.",
          savingTip: "Local music academy partnered to run daytime youth showcase in exchange for promo booth."
        },
        {
          id: "photo_video",
          name: "Community Photo Booth & Drone Video",
          allocated: 2000,
          spent: 1800,
          percentage: 9,
          notes: "Volunteer photography team lead plus drone aerial footage for town archives.",
          savingTip: "High school media arts club earned community service hours assisting lead photographer."
        },
        {
          id: "activities",
          name: "Kids Zone, Pumpkin Painting & Games",
          allocated: 2500,
          spent: 2300,
          percentage: 11,
          notes: "200 mini pumpkins, washable paints, burlap sack races, and giant wooden lawn games.",
          savingTip: "Pumpkins donated by regional wholesale farming cooperative."
        },
        {
          id: "emergency",
          name: "First Aid Tent & Safety Reserve",
          allocated: 2500,
          spent: 800,
          percentage: 12,
          notes: "Certified EMT on-duty tent, bottled water pallets, weather tarps, and emergency reserve.",
          savingTip: "Unused medical emergency reserve returned to community trust."
        }
      ]
    },
    timelineMilestones: [
      {
        id: "m1",
        timeframe: "4 Months Before",
        phase: "City Permits & Safety",
        task: "File park usage permit, emergency action plan, and health department vendor licenses.",
        priority: "High",
        done: true
      },
      {
        id: "m2",
        timeframe: "3 Months Before",
        phase: "Vendor & Musician Call",
        task: "Issue open call for 25 artisanal craft stalls and 6 regional acoustic musicians.",
        priority: "High",
        done: true
      },
      {
        id: "m3",
        timeframe: "6 Weeks Before",
        phase: "Volunteer Recruitment",
        task: "Onboard 40 neighborhood volunteers for set-up, green team waste sorting, and check-in.",
        priority: "High",
        done: true
      },
      {
        id: "m4",
        timeframe: "2 Weeks Before",
        phase: "Community Outreach",
        task: "Distribute posters to local libraries, schools, and neighborhood social media groups.",
        priority: "Medium",
        done: false
      },
      {
        id: "m5",
        timeframe: "Festival Day",
        phase: "Execution & Harvest Celebration",
        task: "Coordinate 8:00 AM park load-in, run auction announcements, and oversee clean-up.",
        priority: "High",
        done: false
      }
    ],
    runOfShow: [
      {
        time: "07:30 AM",
        activity: "Park Gate Access & Electrical Generator Delivery",
        lead: "Logistics Director & City Park Ranger",
        location: "Centennial Park East Gate",
        notes: "Position quiet generators behind pavilion away from foot traffic."
      },
      {
        time: "08:30 AM",
        activity: "Food Trucks & Artisan Market Load-in",
        lead: "Vendor Coordinator",
        location: "Vendor Alley & Great Lawn",
        notes: "Confirm vehicle parking permits and hand out fire extinguishers."
      },
      {
        time: "10:00 AM",
        activity: "Festival Gates Open & Welcome Address",
        lead: "Oakridge Mayor & Festival Chair",
        location: "Gazebo Stage",
        notes: "Opening brass fanfare and announcement of daily schedule."
      },
      {
        time: "11:00 AM",
        activity: "Kids Pumpkin Painting & Sack Races Begin",
        lead: "Youth Activity Team",
        location: "Playground Meadow",
        notes: "Award participation ribbons to every child."
      },
      {
        time: "01:30 PM",
        activity: "Bluegrass Showcase & Apple Pie Baking Contest",
        lead: "Gazebo MC & Celebrity Judges",
        location: "Pavilion Center",
        notes: "Score pies based on crust flakiness, flavor balance, and presentation."
      },
      {
        time: "03:30 PM",
        activity: "Charity Silent Auction Final Calls",
        lead: "Fundraising Director",
        location: "Auction Tent",
        notes: "Over 40 donated local experiences auctioned for community greenhouse."
      },
      {
        time: "05:00 PM",
        activity: "Sunset Community Drum Circle & Closing Folk Sing-along",
        lead: "Music Collective",
        location: "Lawn Amphitheater",
        notes: "Hand out percussion shakers to crowd; thank 40 volunteer leads."
      },
      {
        time: "06:30 PM",
        activity: "Leave No Trace Park Cleanup & Equipment Strike",
        lead: "Green Team & Volunteers",
        location: "Entire Park",
        notes: "Compost hay bales and deposit all sorted recyclables."
      }
    ],
    vendors: [
      {
        id: "v1",
        category: "City & Facilities",
        name: "Oakridge Parks & Recreation",
        role: "Park Supervisor",
        estimatedCost: 3500,
        actualCost: 3500,
        status: "Contracted",
        contact: "parks@oakridgetown.gov",
        keyQuestions: "Confirm sprinkler shutoff schedule 48 hours prior to prevent wet grass.",
        priority: "Critical"
      },
      {
        id: "v2",
        category: "Audio / Visual",
        name: "Valley Sound & Stage",
        role: "Lead Sound Engineer",
        estimatedCost: 3800,
        actualCost: 3600,
        status: "Contracted",
        contact: "info@valleysoundstage.com",
        keyQuestions: "Provide 4 wireless handheld mics and stage monitoring wedges for live acoustic groups.",
        priority: "High"
      },
      {
        id: "v3",
        category: "Sanitation & Green Team",
        name: "EcoCycle Solutions",
        role: "Zero-Waste Manager",
        estimatedCost: 1500,
        actualCost: 1400,
        status: "Contracted",
        contact: "recycle@ecocyclesolutions.org",
        keyQuestions: "Provide 12 three-stream sorting bins (Compost, Recycle, Landfill) with clear signage.",
        priority: "High"
      }
    ],
    personalizedIdeas: {
      signatureActivities: [
        {
          title: "The Great Oakridge Apple Pie Championship",
          description: "Amateur neighborhood bakers submit their finest autumn pies for blind judging by local bakery owners and firefighters, followed by public slice sales for charity.",
          supplies: "Judging ballots, numbered paper plates, pastry forks, trophy ribbon"
        },
        {
          title: "Living Heritage Community Mural",
          description: "A 16-foot canvas tree where every family stamps their handprint leaf in autumnal colors with a 1-word hope for their neighborhood.",
          supplies: "Stretched canvas, non-toxic washable tempura paints, wet wipes"
        }
      ],
      invitationCopy: {
        headline: "CELEBRATE COMMUNITY, HARVEST & HERITAGE",
        opening: "Gather with neighbors, friends, and family for the annual Oakridge Harvest Festival.",
        details: "Saturday, October 10th, 2026. 10:00 AM to 5:30 PM at Centennial Park. Free admission. 25 artisanal makers, 5 food trucks, live gazebo concerts, and kids pumpkin patch.",
        rsvpNote: "Register free attendance and enter the baking contest at oakridgeharvest.org",
        dressCodeAdvice: "Casual autumn park attire. Layers and walking shoes recommended."
      },
      guestExperienceTouch: "Free reusable cotton tote bags featuring a map of neighborhood heritage landmarks distributed at the entrance."
    }
  }
];
