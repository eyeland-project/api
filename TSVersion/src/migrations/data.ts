import { dataMigration } from "./types";

export const data: dataMigration = [
  {
    // Tasks
    durintask: [],
    postask: [],
    pretask: [
      {
        content: "Describe la imagen",
        type: "select",
        topic: "vocabulary",
        imgAlt: "Imagen de un camino",
        imgUrl:
          "https://images.unsplash.com/photo-1589556183130-530470785fab?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
        options: [
          {
            content: "Road",
            correct: true,
            feedback: "¡Muy bien! La imagen muestra un camino."
          },
          {
            content: "Swamp",
            correct: false,
            feedback:
              "Lo siento, no es correcto. La imagen muestra un manglar, no un pantano"
          },
          {
            content: "Bridge",
            correct: false,
            feedback:
              "Lo siento, no es correcto. La imagen muestra un manglar, no un puente."
          }
        ]
      },
      {
        content: "Describe la imagen",
        type: "select",
        topic: "vocabulary",
        imgAlt: "Imagen de un parque natural",
        imgUrl:
          "https://images.unsplash.com/photo-1589556183130-530470785fab?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
        options: [
          {
            content: "Natural park",
            correct: true,
            feedback: "¡Muy bien! La imagen muestra un parque natural."
          },
          {
            content: "Toll",
            correct: false,
            feedback:
              "Lo siento, no es correcto. La imagen muestra un manglar, no un peaje."
          },
          {
            content: "Farm",
            correct: false,
            feedback:
              "Lo siento, no es correcto. La imagen muestra un manglar, no una granja."
          }
        ]
      },
      {
        content: "The road is _ the natural partk",
        type: "fill",
        topic: "prepositions",
        imgAlt: "Imagen de un camino al lado de un parque natural",
        imgUrl:
          "https://res.cloudinary.com/dajnynv13/image/upload/eyeland/task_1/mangroves_1_oxqj8y",
        options: [
          {
            content: "next to",
            correct: true,
            feedback: "¡Correcto! La respuesta es 'next to'."
          },
          {
            content: "between",
            correct: false,
            feedback:
              "Lo siento, no es correcto. La respuesta adecuada es 'next to'."
          },
          {
            content: "behind",
            correct: false,
            feedback:
              "Lo siento, no es correcto. La respuesta adecuada es 'next to'."
          }
        ]
      },
      {
        content: "Describe la imagen",
        type: "select",
        topic: "vocabulary",
        imgAlt: "Imagen de un manglar",
        imgUrl:
          "https://images.unsplash.com/photo-1589556183130-530470785fab?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
        options: [
          {
            content: "Mangrove",
            correct: true,
            feedback: "¡Muy bien! La imagen muestra un manglar."
          },
          {
            content: "Beach",
            correct: false,
            feedback:
              "Lo siento, no es correcto. La imagen muestra un manglar, no una playa."
          },
          {
            content: "Farm",
            correct: false,
            feedback:
              "Lo siento, no es correcto. La imagen muestra un manglar, no una granja."
          }
        ]
      }
    ]
  }
];
