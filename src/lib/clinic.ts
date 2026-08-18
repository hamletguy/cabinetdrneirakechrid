import logo from "@/assets/neira-logo.jpg.asset.json";
import interior1 from "@/assets/cabinet-neira-1.jpg.asset.json";
import reception from "@/assets/cabinet-neira-2.jpg.asset.json";
import room from "@/assets/cabinet-neira-3.jpg.asset.json";
import whitening from "@/assets/blanchissement.jpg.asset.json";
import scaling from "@/assets/detaratrage.jpg.asset.json";
import veneers from "@/assets/facette.jpg.asset.json";
import veneersMagic from "@/assets/facette-magie.jpg.asset.json";

export const clinic = {
  name: "Cabinet Dentaire Dr Neira Kechrid Allani",
  shortName: "Dr Neïra Kechrid Allani",
  tagline: "Votre sourire, notre priorité",
  phone: "56 985 983",
  phoneHref: "tel:+21656985983",
  address:
    "Complexe médical Ibn Rochd, entrée clinique Laouani au-dessus de l'UIB, 1er étage, cabinet B5, 3140",
  hours: [
    { label: "Lundi – Vendredi", value: "8h00 – 17h00" },
    { label: "Samedi", value: "8h00 – 14h00" },
    { label: "Dimanche", value: "Fermé" },
  ],
  about: [
    "Le cabinet du Dr Neïra Kechrid Allani accueille petits et grands dans un espace moderne, lumineux et entièrement stérilisé, au cœur du complexe médical Ibn Rochd.",
    "De la simple consultation aux soins esthétiques comme le blanchiment et les facettes, chaque traitement est expliqué, planifié et réalisé avec des équipements récents.",
    "Notre priorité : des soins doux, sans douleur et sans stress, pour que vous repartiez avec un sourire dont vous êtes fier.",
  ],
};

export const images = {
  logo: logo.url,
  reception: reception.url,
  interior: interior1.url,
  room: room.url,
  gallery: [
    { url: room.url, alt: "Salle de soins du cabinet dentaire" },
    { url: reception.url, alt: "Accueil du cabinet dentaire" },
    { url: interior1.url, alt: "Couloir et cabinets de consultation" },
    { url: whitening.url, alt: "Avant / après un blanchiment dentaire" },
    { url: scaling.url, alt: "Avant / après un détartrage" },
    { url: veneers.url, alt: "Avant / après la pose de facettes dentaires" },
    { url: veneersMagic.url, alt: "Avant / après une correction esthétique du sourire" },
  ],
};
