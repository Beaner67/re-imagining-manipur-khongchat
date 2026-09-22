/* Khongchat demo data.
   Places and events are real. Coordinates are approximate.
   Listings (homestays, guides, artisans) are SAMPLE data for the prototype.
   Event dates vary each year: confirm with Manipur Tourism before publishing. */

window.KC_DATA = {
  interests: [
    { id: "heritage", label: "Heritage" },
    { id: "nature", label: "Nature" },
    { id: "culture", label: "Culture" },
    { id: "food", label: "Food" },
    { id: "adventure", label: "Adventure" },
    { id: "shopping", label: "Crafts and shopping" },
    { id: "sports", label: "Sports" }
  ],

  regions: {
    imphal: "Imphal city",
    loktak: "Loktak and Moirang",
    east: "Thoubal, Kakching and Andro",
    ukhrul: "Ukhrul",
    senapati: "Senapati and Mao",
    tamenglong: "Tamenglong",
    churachandpur: "Churachandpur"
  },
  /* Hill districts: a full day of road travel each, so the planner adds them from day 3. */
  hillRegions: ["ukhrul", "senapati", "tamenglong", "churachandpur"],

  places: [
    { id: "kangla", name: "Kangla Fort", region: "imphal", lat: 24.808, lon: 93.942, tags: ["heritage", "culture"], hours: "9 AM to 4 PM",
      blurb: "Seat of the Meitei kings for centuries, on the banks of the Imphal river.", tip: "Go before 10 AM for the quiet grounds." },
    { id: "govindajee", name: "Shree Govindajee Temple", region: "imphal", lat: 24.806, lon: 93.945, tags: ["heritage", "culture"], hours: "Dawn to dusk",
      blurb: "Vaishnavite temple beside the old palace, with twin gold domes.", tip: "Evening aarti is the time to visit." },
    { id: "imakeithel", name: "Ima Keithel", region: "imphal", lat: 24.808, lon: 93.937, tags: ["food", "shopping", "culture"], hours: "Morning to 4 PM",
      blurb: "A market run entirely by women, trading for generations.", tip: "Try eromba and singju. Carry cash." },
    { id: "museum", name: "Manipur State Museum", region: "imphal", lat: 24.806, lon: 93.938, tags: ["heritage", "culture"], hours: "10 AM to 4 PM, closed Mondays",
      blurb: "Textiles, royal boats and tribal collections from across the state.", tip: "Look for the royal hiyang hiren boat." },
    { id: "warcemetery", name: "Imphal War Cemetery", region: "imphal", lat: 24.826, lon: 93.940, tags: ["heritage"], hours: "8 AM to 4 PM",
      blurb: "Commonwealth graves from the 1944 Battle of Imphal.", tip: "Quiet and well kept. Short visit." },
    { id: "marjing", name: "Marjing Polo Statue", region: "imphal", lat: 24.830, lon: 94.020, tags: ["sports", "heritage"], hours: "Open all day",
      blurb: "A giant polo rider on a Manipuri pony. Manipur is the home of modern polo.", tip: "Best at sunset, views over the valley." },
    { id: "sendra", name: "Sendra, Loktak Lake", region: "loktak", lat: 24.525, lon: 93.800, tags: ["nature"], hours: "Daytime",
      blurb: "Largest freshwater lake in the Northeast, dotted with floating phumdis.", tip: "Take a boat out in the late afternoon." },
    { id: "keibul", name: "Keibul Lamjao National Park", region: "loktak", lat: 24.490, lon: 93.820, tags: ["nature"], hours: "Early morning best",
      blurb: "The world's only floating national park, home of the sangai deer.", tip: "Sangai are most active at dawn." },
    { id: "ina", name: "INA Memorial, Moirang", region: "loktak", lat: 24.499, lon: 93.776, tags: ["heritage"], hours: "10 AM to 4 PM",
      blurb: "Where the Indian National Army raised the tricolour in 1944.", tip: "Pair it with Loktak the same day." },
    { id: "takmu", name: "Takmu Water Sports Complex", region: "loktak", lat: 24.520, lon: 93.790, tags: ["adventure", "nature"], hours: "Daytime, weather permitting",
      blurb: "Kayaking and boating on Loktak.", tip: "Check operating status before you go." },
    { id: "andro", name: "Andro village", region: "east", lat: 24.767, lon: 94.050, tags: ["culture", "shopping", "heritage"], hours: "Daytime",
      blurb: "Ancient village known for hand-built black pottery and a living cultural complex.", tip: "Buy direct from the potters." },
    { id: "khongjom", name: "Khongjom War Memorial", region: "east", lat: 24.450, lon: 94.030, tags: ["heritage"], hours: "Daytime",
      blurb: "Marks the 1891 Anglo-Manipur war. Remembered every April on Khongjom Day.", tip: "Climb the hillock for the view." },
    { id: "kakching", name: "Kakching Garden", region: "east", lat: 24.490, lon: 93.985, tags: ["nature"], hours: "9 AM to 5 PM",
      blurb: "Hillside garden with walking trails and views over Kakching town.", tip: "Good family stop." },
    { id: "zoo", name: "Manipur Zoological Garden", region: "imphal", lat: 24.800, lon: 93.890, tags: ["nature"], hours: "9 AM to 4 PM, closed Mondays",
      blurb: "At Iroisemba, at the foot of the western hills. The easiest place to see the sangai deer.", tip: "Good if you cannot make dawn at Keibul Lamjao." },
    { id: "bishnupur", name: "Vishnu Temple, Bishnupur", region: "loktak", lat: 24.630, lon: 93.770, tags: ["heritage"], hours: "Daytime",
      blurb: "A small brick temple from the 15th century, with a Chinese-style roof.", tip: "It sits on the road to Moirang. Stop on the way." },
    { id: "shirui", name: "Shirui Hills", region: "ukhrul", lat: 25.100, lon: 94.450, tags: ["nature", "adventure"], hours: "Daytime trek",
      blurb: "Home of the Shirui lily, which blooms nowhere else.", tip: "Lily season is around May." },
    { id: "khangkhui", name: "Khangkhui Cave", region: "ukhrul", lat: 25.050, lon: 94.380, tags: ["nature", "adventure", "heritage"], hours: "Daytime",
      blurb: "Limestone cave near Ukhrul town, used as a shelter by villagers in the Second World War.", tip: "Carry a torch and wear shoes with grip." },
    { id: "dzuko", name: "Dzuko Valley", region: "senapati", lat: 25.550, lon: 94.070, tags: ["nature", "adventure"], hours: "Overnight trek",
      blurb: "High valley on the Manipur and Nagaland border, carpeted with flowers in season.", tip: "Go with a local guide." },
    { id: "makhel", name: "Makhel", region: "senapati", lat: 25.470, lon: 94.090, tags: ["heritage", "culture"], hours: "Daytime",
      blurb: "Mao Naga village honoured as a place of origin by many Naga peoples, with its ancestral stones.", tip: "Ask the village council before taking photos." },
    { id: "zeilad", name: "Zeilad Lake", region: "tamenglong", lat: 24.880, lon: 93.450, tags: ["nature"], hours: "Daytime",
      blurb: "A cluster of quiet lakes in the Zeliangrong Naga hills, rich in birds.", tip: "Mornings are clear before the mist rolls in." },
    { id: "tharon", name: "Tharon Cave", region: "tamenglong", lat: 24.930, lon: 93.520, tags: ["adventure", "heritage"], hours: "Daytime, with a guide",
      blurb: "Long cave system near Tharon village, with signs of ancient settlement.", tip: "Hire a guide from the village." },
    { id: "khuga", name: "Khuga Dam", region: "churachandpur", lat: 24.270, lon: 93.660, tags: ["nature"], hours: "Daytime",
      blurb: "Reservoir in the southern hills, with green slopes and a long walk along the dam.", tip: "Check local advisories before you travel." }
  ],

  /* months: 0-11, approximate. Most follow the lunar calendar, so dates move each year. */
  events: [
    { name: "Manipur Sangai Festival", who: "Statewide", months: [10], when: "November, annually", place: "Imphal and venues statewide", tags: ["culture", "food", "shopping"],
      blurb: "The state's biggest tourism festival: dance, crafts, food and polo." },
    { name: "Yaoshang", who: "Meitei", months: [1, 2], when: "February or March, full moon", place: "Across the valley", tags: ["culture", "sports"],
      blurb: "Five days of Thabal Chongba folk dance and sports." },
    { name: "Cheiraoba", who: "Meitei", months: [2, 3], when: "March or April, Sajibu month", place: "Across the valley", tags: ["culture", "food"],
      blurb: "Meitei new year. Families cook a feast, then climb a nearby hill for luck in the year ahead." },
    { name: "Lai Haraoba", who: "Meitei", months: [3, 4], when: "April to May", place: "Village shrines", tags: ["culture", "heritage"],
      blurb: "Ritual festival of the Umang Lai forest deities." },
    { name: "Kang", who: "Meitei", months: [5, 6], when: "June or July", place: "Shree Govindajee Temple and neighbourhoods", tags: ["culture", "heritage"],
      blurb: "The Manipuri chariot festival. Nights of Thabal Chongba in every locality." },
    { name: "Heikru Hidongba", who: "Meitei", months: [8], when: "September", place: "Bijoy Govinda, Imphal", tags: ["culture", "sports", "heritage"],
      blurb: "Royal boat race on the palace moat, with long dragon-headed boats." },
    { name: "Mera Houchongba", who: "Meitei, Naga and Kuki", months: [9], when: "October, Mera month", place: "Kangla Fort", tags: ["culture", "heritage"],
      blurb: "Hill and valley peoples meet at Kangla to exchange gifts, an old festival of unity." },
    { name: "Ningol Chakouba", who: "Meitei", months: [9, 10], when: "October or November", place: "Homes across the valley", tags: ["food", "culture"],
      blurb: "Married daughters return home for a family feast and gifts." },
    { name: "Ras Leela", who: "Meitei", months: [10], when: "Kartik full moon, November", place: "Shree Govindajee Temple", tags: ["culture", "heritage"],
      blurb: "All-night Manipuri classical dance of Krishna and the gopis." },
    { name: "Emoinu Eratpa", who: "Meitei", months: [11, 0], when: "December or January", place: "Homes across the valley", tags: ["culture", "food"],
      blurb: "Honours Emoinu, goddess of wealth and the home, with a quiet evening offering." },
    { name: "Lui-Ngai-Ni", who: "Naga", months: [1], when: "15 February", place: "Naga villages, host district rotates", tags: ["culture"],
      blurb: "Seed-sowing festival shared by the Naga peoples of Manipur. Dance, song and full dress." },
    { name: "Luira Phanit", who: "Tangkhul Naga", months: [1, 2], when: "February or March", place: "Ukhrul", tags: ["culture"],
      blurb: "The Tangkhul seed-sowing festival that opens the farming year." },
    { name: "Shirui Lily Festival", who: "Tangkhul Naga", months: [4], when: "Around May", place: "Ukhrul", tags: ["nature", "culture"],
      blurb: "Celebrates the lily found only on Shirui hills." },
    { name: "Kut", who: "Kuki-Chin-Mizo", months: [10], when: "1 November", place: "Across the state", tags: ["culture"],
      blurb: "Post-harvest festival of the Kuki-Chin-Mizo communities." },
    { name: "Chumpha", who: "Tangkhul Naga", months: [11], when: "December", place: "Ukhrul", tags: ["culture", "food"],
      blurb: "Tangkhul post-harvest festival. A time of feasting and thanks." },
    { name: "Gaan-Ngai", who: "Zeliangrong Naga", months: [11, 0], when: "December or January", place: "Tamenglong and Imphal", tags: ["culture", "heritage"],
      blurb: "Five-day post-harvest festival of the Zeliangrong people, with sacred fire and dance." },
    { name: "Tamenglong Orange Festival", who: "Statewide", months: [11, 0], when: "December or January", place: "Tamenglong", tags: ["food", "shopping"],
      blurb: "The hill district's famous oranges, with a farmers' market and local food." }
  ],

  /* SAMPLE LISTINGS: invented for the prototype. Replace with verified partners. */
  listings: [
    { type: "stay", name: "Phumdi View Homestay (sample)", region: "loktak", note: "4 rooms, lake-facing, meals included", stampId: "loktak" },
    { type: "stay", name: "Kangla Courtyard Guesthouse (sample)", region: "imphal", note: "Walk to Kangla and Ima Keithel" },
    { type: "stay", name: "Moirang Lakeside Rooms (sample)", region: "loktak", note: "Near the INA Memorial, boat trips arranged" },
    { type: "stay", name: "Andro Village Homestay (sample)", region: "east", note: "Stay with a potter's family" },
    { type: "stay", name: "Shirui Hill Homestay (sample)", region: "ukhrul", note: "Tangkhul family home, trek starts at the door" },
    { type: "stay", name: "Ukhrul Town Lodge (sample)", region: "ukhrul", note: "Central, hot water, parking" },
    { type: "stay", name: "Mao Gate Guesthouse (sample)", region: "senapati", note: "Base for the Dzuko trek" },
    { type: "stay", name: "Tamenglong Orchard Stay (sample)", region: "tamenglong", note: "Orange farm, winter fruit season" },
    { type: "eat", name: "Ima's Kitchen (sample)", region: "imphal", note: "Eromba, singju, chak-hao kheer", stampId: "imakeithel" },
    { type: "eat", name: "Loktak Fish Thali (sample)", region: "loktak", note: "Local fish curry, lunch only" },
    { type: "eat", name: "Paona Bazaar Tea Stall (sample)", region: "imphal", note: "Morning tea and kanghou snacks" },
    { type: "eat", name: "Tangkhul Kitchen (sample)", region: "ukhrul", note: "Smoked pork, bamboo shoot, hawaijar" },
    { type: "guide", name: "Valley Heritage Walks (sample)", region: "imphal", note: "Kangla and old city, English and Hindi" },
    { type: "guide", name: "Shirui Trek Guides (sample)", region: "ukhrul", note: "Day treks, lily season" },
    { type: "guide", name: "Dzuko Valley Guides (sample)", region: "senapati", note: "Overnight treks from Mao" },
    { type: "craft", name: "Andro Pottery Collective (sample)", region: "east", note: "Hand-built black pottery, buy direct", stampId: "andro" },
    { type: "craft", name: "Wangkhei Phee Weavers (sample)", region: "imphal", note: "Handloom phanek and innaphi" },
    { type: "craft", name: "Longpi Stone Pottery (sample)", region: "ukhrul", note: "Black stone pottery from Longpi village" },
    { type: "move", name: "Imphal Airport to city", region: "imphal", note: "About 8 km. Prepaid taxis at arrivals." },
    { type: "move", name: "Imphal to Moirang and Loktak", region: "loktak", note: "About 45 km by road. Shared taxis from Imphal." }
  ],

  stamps: [
    { id: "andro", name: "Andro pottery", where: "Andro Pottery Collective" },
    { id: "loktak", name: "Loktak homestay", where: "Phumdi View Homestay" },
    { id: "imakeithel", name: "Ima Keithel", where: "Ima's Kitchen" }
  ],
  unlock: { need: 3, reward: "Guided Andro village walk with a potter" },

  /* Saved with the trip so they work offline. */
  contacts: [
    { label: "Emergency (all India)", number: "112" },
    { label: "Tourist helpline, Ministry of Tourism", number: "1363" }
  ],
  ilp: [
    "Valid photo ID",
    "Passport-size photo",
    "Address proof",
    "Sponsor or host details",
    "Apply online, or at Imphal airport or the Mao and Jiribam gates"
  ],

  months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],

  sources: [
    { label: "Domestic visits: 139,500 (2022) to 58,000 (2023). Ministry of Tourism, via CEIC", url: "https://www.ceicdata.com/en/india/resident-visits-by-states/visitor-arrivals-local-manipur" },
    { label: "4,374 hours without internet in Manipur in 2023. SFLC.in, Let the Net Work 2.0 (via The Wire)", url: "https://m.thewire.in/article/government/internet-shutdown-manipur-haryana-bihar/amp" },
    { label: "Inner Line Permit portal, Government of Manipur", url: "https://manipurilponline.mn.gov.in/" }
  ]
};
