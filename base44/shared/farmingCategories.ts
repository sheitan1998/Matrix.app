// Filters read from the official FS25 ModHub navigation, not invented aggregate filters.
const group = (id, label, filters) => ({ id, label, filters: filters.split(' ') });
export const FARMING_CATALOG_CATEGORIES = [
  group('tractors', 'Tracteurs', 'tractorsS tractorsM tractorsL'),
  group('trailers', 'Remorques', 'trailers augerWagons trailersChangingSystem trailersFlatbed lowloaders trailersSemi'),
  group('harvesters', 'Moissonneuses et récolte', 'harvesters cutters cornHeaders specialHeaders cutterTrailers combineWindrower forageHarvesters forageHarvesterCutters forageHarvesterCutterTrailers'),
  group('tillage', 'Outils du sol', 'plows cultivators discHarrows powerHarrows subsoilers mulchers spaders stonePickers rollers weeders'),
  group('maps', 'Cartes / Maps', 'mapEurope mapNorthAmerica mapSouthAmerica mapOthers'),
  group('seeding', 'Semis et plantation', 'seeders planters seedTanks palletSeeds'),
  group('grassland', 'Fenaison et balles', 'mowers tedders windrowers loaderWagons grasslandCare palletGrassland balersSquare balersRound baleLoaders baleWrappers balingMisc palletBaling leveler silocompaction palletSilage'),
  group('buildings', 'Bâtiments et stockage', 'sheds gardenSheds farmhouses storages containers dieselTanks waterTanks fillableTanks silos siloExtensions'),
  group('vehicles', 'Véhicules utilitaires', 'trucks cars miscDrivables'),
  group('loaders', 'Chargeurs et manutention', 'frontLoaderVehicles frontLoaders frontLoaderTools teleLoaderVehicles teleLoaderTools wheelLoaderVehicles wheelLoaderTools skidSteerVehicles skidSteerTools forklifts'),
  group('fertilizing', 'Fertilisation et pulvérisation', 'sprayers manureSpreaders fertilizerSpreaders slurryTanks slurryTools slurryTransport palletFertilizerHerbicide'),
  group('animals', 'Élevage et enclos', 'animalpens forageMixers barrels animalTransport strawBlowers palletAnimals objectAnimal beeHives'),
  group('specialCrops', 'Cultures spécialisées', 'beetHarvesters beetHarvesterCutters beetLoading potatoPlanting potatoHarvesting vegetablePlanters vegetableHarvesters spinachHarvesters greenBeanHarvesters peaHarvesters palletVegetables ricePlanters riceHarvesters sugarcanePlanters sugarcaneHarvesters sugarcaneTransport cottonHarvesters cottonTransport specialCropsPallets oliveHarvesters grapeHarvesters grapeTrailers grapeTools'),
  group('forestry', 'Foresterie', 'forestryHarvesters forestryForwarders forestryExcavators forestryExcavatorTools woodTransport woodChippers forestryMulchers forestryWinches forestryPlanters forestryStumpCutters forestryMisc palletForestry'),
  group('productions', 'Usines et productions', 'productionPoints sellingPoints generators'),
  group('landscaping', 'Décoration et aménagement', 'fences trees floodLighting decoration placeableMisc'),
  group('scripts', 'Scripts / Gameplay', 'gameplay'),
  group('packs', 'Packs et mods officiels', 'package officialMods'),
  group('others', 'Accessoires et divers', 'weights belts winterEquipment misc bigbags bigbagPallets ibc pallets bales objectMisc chainsaws shovels flashlights markingSpray handtoolsMisc prefab'),
];
export const ALLOWED_MODHUB_FILTERS = new Set(['latest', 'mostDownloaded', ...FARMING_CATALOG_CATEGORIES.flatMap(category => category.filters)]);