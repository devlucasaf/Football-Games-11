import React, { useState, useEffect } from "react";
import { Users, Trophy, Globe, Calendar, Save, RotateCcw, ChevronRight } from 'lucide-react';

const FormacaoFutebol = () => { 
    const [activeView, setActiveView] = React.useState('menu');
    const [selectedMode, setSelectedMode] = useState(null);
    const [formation, setFormation] = useState('4-4-2');
    const [selectedPlayers, setSelectedPlayers] = useState({});
    const [currentRound, setCurrentRound] = useState(1);
    const [savedLineups, setSavedLineups] = useState([]);

    const formations = {
        '4-4-2': {
            GK: [{x: 50, y: 90}], // goleiro
            LD: [{x: 80, y: 80}], // lateral direito
            ZAG: [{x: 35, y: 75}, {x: 65, y: 75}], // zagueiros
            LE: [{x: 20, y: 80}], // lateral esquerdo
            VOL: [{x: 50, y: 55}], // volante
            MC: [{x: 30, y: 45}, {x: 70, y: 45}], // meio-campistas
            PE: [{x: 20, y: 30}], // ponta esquerda
            PD: [{x: 80, y: 30}], // ponta direita
            ATA: [{x: 35, y: 15}, {x: 65, y: 15}]  // atacantes
        },
        '4-3-3': {
            GK: [{x: 50, y: 90}], // goleiro
            LD: [{x: 80, y: 70}], // lateral direito
            ZAG: [{x: 35, y: 75}, {x: 65, y: 75}], // zagueiros
            LE: [{x: 20, y: 80}], // lateral esquerdo
            VOL: [{x: 50, y: 55}], // volante
            MC: [{x: 30, y: 45}, {x: 70, y: 45}], // meio-campistas
            PE: [{x: 20, y: 30}], // ponta esquerda
            PD: [{x: 80, y: 30}], // ponta direita
            ATA: [{x: 35, y: 15}, {x: 65, y: 15}]  // atacantes
        },
        '3-5-2': {
        GK: [{x: 50, y: 90}], // goleiro
        ZAG: [{x: 25, y: 75}, {x: 50, y: 75}, {x: 75, y: 75}], // zagueiros
        LD: [{x: 85, y: 55}], // lateral direito
        LE: [{x: 15, y: 55}], // lateral esquerdo
        VOL: [{x: 40, y: 50}, {x: 60, y: 50}], // volantes
        MC: [{x: 50, y: 35}], // meio-campista
        ATA: [{x: 35, y: 15}, {x: 65, y: 15}] // atacantes
        },
        // ATUALIZAR
        '4-5-1': {
            GK: [{x: 50, y: 90}], // goleiro
            LD: [{x: 80, y: 70}], // lateral direito
            ZAG: [{x: 35, y: 75}, {x: 65, y: 75}], // zagueiros
            LE: [{x: 20, y: 80}], // lateral esquerdo
            VOL: [{x: 50, y: 55}], // volante
            MC: [{x: 30, y: 45}, {x: 70, y: 45}], // meio-campistas
            PE: [{x: 20, y: 30}], // ponta esquerda
            PD: [{x: 80, y: 30}], // ponta direita
            ATA: [{x: 35, y: 15}, {x: 65, y: 15}]  // atacantes
        },
        
        // ATUALIZAR
        '5-4-1': {
            GK: [{x: 50, y: 90}], // goleiro
            LD: [{x: 80, y: 70}], // lateral direito
            ZAG: [{x: 35, y: 75}, {x: 65, y: 75}], // zagueiros
            LE: [{x: 20, y: 80}], // lateral esquerdo
            VOL: [{x: 50, y: 55}], // volante
            MC: [{x: 30, y: 45}, {x: 70, y: 45}], // meio-campistas
            PE: [{x: 20, y: 30}], // ponta esquerda
            PD: [{x: 80, y: 30}], // ponta direita
            ATA: [{x: 35, y: 15}, {x: 65, y: 15}]  // atacantes
        },
        // ATUALIZAR
        '5-3-2': {
            GK: [{x: 50, y: 90}], // goleiro
            LD: [{x: 80, y: 70}], // lateral direito
            ZAG: [{x: 35, y: 75}, {x: 65, y: 75}], // zagueiros
            LE: [{x: 20, y: 80}], // lateral esquerdo
            VOL: [{x: 50, y: 55}], // volante
            MC: [{x: 30, y: 45}, {x: 70, y: 45}], // meio-campistas
            PE: [{x: 20, y: 30}], // ponta esquerda
            PD: [{x: 80, y: 30}], // ponta direita
            ATA: [{x: 35, y: 15}, {x: 65, y: 15}]  // atacantes
        },
        
        // ATUALIZAR
        '4-2-4': {
            GK: [{x: 50, y: 90}], // goleiro
            LD: [{x: 80, y: 70}], // lateral direito
            ZAG: [{x: 35, y: 75}, {x: 65, y: 75}], // zagueiros
            LE: [{x: 20, y: 80}], // lateral esquerdo
            VOL: [{x: 50, y: 55}], // volante
            MC: [{x: 30, y: 45}, {x: 70, y: 45}], // meio-campistas
            PE: [{x: 20, y: 30}], // ponta esquerda
            PD: [{x: 80, y: 30}], // ponta direita
            ATA: [{x: 35, y: 15}, {x: 65, y: 15}]  // atacantes
        }
    };
}