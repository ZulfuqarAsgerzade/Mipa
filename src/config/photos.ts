// Placeholder photography from Wikimedia Commons until MIPA's own factory photos are supplied.
// Several are CC BY and legally need a credit line wherever they are shown.
export const photos = {
  "mold-open": { w: 2000, h: 1331, artist: "Bricetofly", license: "CC0", source: "https://commons.wikimedia.org/wiki/File:Injection_mold_-_(7).jpg" },
  "mold-full": { w: 2000, h: 1331, artist: "Bricetofly", license: "CC0", source: "https://commons.wikimedia.org/wiki/File:Injection_mold_-_(6).jpg" },
  "mold-detail": { w: 2000, h: 1331, artist: "Bricetofly", license: "CC0", source: "https://commons.wikimedia.org/wiki/File:Injection_mold_-_(2).jpg" },
  "mold-slide": { w: 2000, h: 1331, artist: "Bricetofly", license: "CC0", source: "https://commons.wikimedia.org/wiki/File:Injection_mold_-_(3).jpg" },
  "mold-core": { w: 2000, h: 1331, artist: "Bricetofly", license: "CC0", source: "https://commons.wikimedia.org/wiki/File:Injection_mold_-_(11).jpg" },
  "mold-nozzle": { w: 2000, h: 1331, artist: "Bricetofly", license: "CC0", source: "https://commons.wikimedia.org/wiki/File:Injection_mold_-_(1).jpg" },
  "injection-machine": { w: 2000, h: 1331, artist: "Bricetofly", license: "CC0", source: "https://commons.wikimedia.org/wiki/File:Arburg-swiss_plastic_2026.jpg" },
  "cnc-spindle": { w: 2000, h: 1500, artist: "Millermaster", license: "Public domain", source: "https://commons.wikimedia.org/wiki/File:Tiefbohren_auf_Bearbeitungszentrum.JPG" },
  "diecast-machine": { w: 2000, h: 1500, artist: "PlugPray", license: "Public domain", source: "https://commons.wikimedia.org/wiki/File:Diecasting_machine.jpg" },
  "diecast-dies": { w: 1824, h: 1216, artist: "Swoolverton", license: "CC BY 3.0", source: "https://commons.wikimedia.org/wiki/File:Magnesium_die_casting_dies.jpg" },
  cmm: { w: 2000, h: 1333, artist: "Adrian Grycuk", license: "CC BY 3.0 PL", source: "https://commons.wikimedia.org/wiki/File:Wsp%C3%B3%C5%82rz%C4%99dno%C5%9Bciowa_maszyna_pomiarowa_Gmach_Stary_Technologiczny_2026.jpg" },
  "auto-robots": { w: 2000, h: 1333, artist: "Mixabest", license: "Public domain", source: "https://commons.wikimedia.org/wiki/File:FANUC_R2000iB_AtWork.jpg" },
  "auto-line": { w: 2000, h: 1333, artist: "Marek Ślusarczyk (Tupungato)", license: "CC BY 3.0", source: "https://commons.wikimedia.org/wiki/File:001_Car_factory_assembly_line_-_Opel_factory_in_Gliwice,_Poland.jpg" },
  press: { w: 2000, h: 1333, artist: "Reinold Tomberg", license: "CC BY 3.0", source: "https://commons.wikimedia.org/wiki/File:Schuler_wittevm_004.jpg" },
  paving: { w: 2000, h: 1500, artist: "Mateusz Konieczny", license: "CC0", source: "https://commons.wikimedia.org/wiki/File:Mix_of_paving_stones_IMG_20200910_163455.jpg" },
} as const;

export type PhotoKey = keyof typeof photos;
