/* Utility Platform — central tool catalog.
   Add each new live tool here once. Higher addedOrder = newer.
   Homepage and tools.html use this single registry for cards, search, and category counts. */
window.UTILITY_TOOLS = [
  {slug:"remove-line-breaks",title:"Remove Line Breaks Online",href:"remove-line-breaks.html",category:"digital-developer",description:"Join wrapped lines, preserve paragraphs, or replace line breaks with spaces and custom separators.",addedOrder:12,keywords:["remove line breaks","line break remover","remove newlines","line breaks","newline remover","unwrap text","pdf line breaks"]},
  {slug:"duplicate-line-remover",title:"Duplicate Line Remover",href:"duplicate-line-remover.html",category:"digital-developer",description:"Remove repeated lines while preserving order, with options for case, whitespace, blank lines and which occurrence to keep.",addedOrder:11,keywords:["duplicate line remover","remove duplicate lines","duplicate lines","deduplicate text","dedupe list","unique lines","remove repeats"]},
  {slug:"text-cleaner",title:"Text Cleaner Online",href:"text-cleaner.html",category:"digital-developer",description:"Clean messy text by trimming lines, removing extra spaces, blank lines and duplicate lines, and normalizing line breaks.",addedOrder:10,keywords:["text cleaner","clean text","text formatter","remove extra spaces","remove blank lines","remove duplicate lines","line breaks","whitespace"]},
  {slug:"conduit-fill",title:"Conduit Fill Calculator",href:"conduit-fill-calculator.html",category:"energy-electrical",description:"Check raceway fill for mixed conductors and find the smallest practical conduit size.",addedOrder:8,keywords:["conduit","raceway","fill","NEC","EMT","PVC"]},
  {slug:"wire-size",title:"Wire Size & Voltage Drop Calculator",href:"wire-size-calculator.html",category:"energy-electrical",description:"Plan cable size from load, voltage, distance, material and voltage-drop target.",addedOrder:7,keywords:["wire","cable","AWG","voltage drop","solar cable","inverter cable"]},
  {slug:"paint",title:"Paint Calculator",href:"paint-calculator.html",category:"home-construction",description:"Estimate paint needed for walls and ceilings, subtract openings, choose coats and coverage, and convert gallons and litres.",addedOrder:9,keywords:["paint","paint calculator","how much paint do I need","paint coverage","gallons","litres","walls","ceiling"]},
  {slug:"fence",title:"Fence Material Calculator",href:"fence-calculator.html",category:"home-construction",description:"Estimate posts, rails, pickets or panels, concrete and optional material cost.",addedOrder:6,keywords:["fence","posts","rails","pickets","panels","gate"]},
  {slug:"gravel",title:"Gravel Quantity & Ordering Planner",href:"gravel-calculator.html",category:"home-construction",description:"Estimate gravel volume, approximate weight, bags and optional project cost.",addedOrder:5,keywords:["gravel","aggregate","stone","cubic yards","tons"]},
  {slug:"uuid",title:"UUID Generator & Validator",href:"uuid-generator-calculator.html",category:"digital-developer",description:"Generate UUIDs, validate values and inspect version and variant information.",addedOrder:4,keywords:["uuid","guid","unique id","identifier","v4","v7"]},
  {slug:"pilot-hole",title:"Pilot Hole Size Calculator",href:"pilot-hole-calculator.html",category:"home-construction",description:"Find practical pilot, clearance and countersink drill-bit starting sizes.",addedOrder:3,keywords:["pilot hole","screw","drill","clearance","countersink"]},
  {slug:"time",title:"Time Calculator",href:"time-calculator.html",category:"math-science",description:"Add and subtract hours, minutes and seconds, or find the time between values.",addedOrder:2,keywords:["time","duration","hours","minutes","seconds"]},
  {slug:"significant-figures",title:"Significant Figures Calculator",href:"calculator.html",category:"math-science",description:"Calculate with significant figures and control precision without losing useful context.",addedOrder:1,keywords:["significant figures","sig figs","precision","rounding"]}
];

window.UTILITY_CATEGORIES = [
  {id:"math-science",title:"Math & Science",description:"Calculators for precision, measurements, scientific and everyday math.",icon:"∑"},
  {id:"home-construction",title:"Home & Construction",description:"Material, measuring, estimating and project-planning utilities.",icon:"⌂"},
  {id:"energy-electrical",title:"Energy & Electrical",description:"Wire sizing, voltage drop, conduit fill and future circuit tools.",icon:"ϟ"},
  {id:"digital-developer",title:"Digital & Developer",description:"Identifiers, formats and practical developer workflow utilities.",icon:"<>"},
  {id:"finance",title:"Finance",description:"Financial planning and money utilities as the platform expands.",icon:"$"},
  {id:"converters",title:"Converters",description:"Unit and format conversion tools for common real-world tasks.",icon:"↔"}
];
