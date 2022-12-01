const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const Tasks = require("./Tasks")

/*create table Preguntas (
    ID_Pregunta serial not null,
    Pregunta varchar(255) not null,
    Imagen varchar(255),
    Audio varchar(255),
    Video varchar(255),
    Retroalimentacion varchar(255),
    Tipo varchar(255) not null,
    Examen boolean not null,
    ID_Task serial not null,
    Orden integer not null,
    -- CONSTRAINTS
    constraint pk_pregunta primary key (ID_Pregunta)
    constraint fk_task foreign key (ID_Task) references Tasks(ID_Task)
    -- unique key with ID_Task and Orden
    constraint uk_constr unique (ID_Task, Orden)
);*/
// model definition
const Preguntas = sequelize.define('preguntas', {
    id_pregunta: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    pregunta: {
        type: DataTypes.STRING,
        allowNull: false
    },
    imagen: {
        type: DataTypes.STRING,
        allowNull: true
    },
    audio: {
        type: DataTypes.STRING,
        allowNull: true
    },
    video: {
        type: DataTypes.STRING,
        allowNull: true
    },
    retroalimentacion: {
        type: DataTypes.STRING,
        allowNull: true
    },
    tipo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    examen: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    orden: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    timestamps: false
});

Tasks.hasMany(Preguntas, {
    foreignKey: 'id_task'
    });
Preguntas.belongsTo(Tasks, {
    foreignKey: 'id_task'
    });

module.exports = Preguntas;