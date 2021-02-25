export const testMatch = {
    "map": {
        "size": {
            "x": 19,
            "y": 25
        },
        "tiles": "FFFFMFMssssMMMMRFpppFRMMMFFFMMFFFFFFFMMMRprprpRFMMFFprrrrpFpFppMMRRrrrRRFFMFprrpprppppppFMRRRbRRRpFFppprpprprrrrpFpppprrrpppFprrrpFrFrpprpppppppFrpFppppFrMFrFrpprrrrMMppprrrpFFprrpprrrpprFFrpMpFprpFpFFFprpprFrpprFrrrrppprppppFpprrrrFrpprrrpprFrrrrppFpppprppprrrrFrpprFrpprpFFFpFprpFpMprFFrpprrrpprrpFFprrrpppMMrrrrpprFrFMrFppppFprFppppppprpprFrFprrrpFppprrrppppFprrrrprpprpppFFpRRRbRRRMFpppppprpprrpFMFFRRrrrRRMMppFpFprrrrpFFMMFRprprpRMMMFFFFFFFMMFFFMMMRFpppFRMMMMssssMFMFFFF"
    },
    "players": [
        {
            "id": 0,
            "is_local": true,
            "team": 0,
            "is_victorious": false,
            "is_human": true
        },
        {
            "id": 1,
            "is_local": true,
            "team": 1,
            "is_victorious": false,
            "is_human": true
        }
    ],
    "state": {
        "turnNumber": 1,
        "gold": {
            "1": 100,
            "0": 400
        },
        "units": [
            {
                "id": 1,
                "garrisonClassId": "garrison",
                "setHealth": null,
                "transportedBy": -1,
                "unitClassId": "city",
                "loadedUnits": {},
                "damageTakenPercent": 100,
                "grooveId": "",
                "playerId": 1,
                "health": 100,
                "hadTurn": false,
                "inTransport": false,
                "state": {},
                "attackerId": -1,
                "pos": {
                    "facing": 0,
                    "x": 3,
                    "y": 2
                },
                "canBeAttacked": true,
                "grooveCharge": 0,
                "attackerUnitClass": "",
                "attackerPlayerId": -1,
                "killedByLosing": false,
                "recruits": {},
                "startPos": {
                    "facing": 0,
                    "x": 3,
                    "y": 2
                },
                "setGroove": null,
                "unitClass": {
                    "weapons": {},
                    "inAir": false,
                    "moveRange": 0,
                    "isCommander": false,
                    "tags": [
                        "structure"
                    ],
                    "cost": 500,
                    "passiveMultiplier": 1.0,
                    "id": "city",
                    "transportTags": {},
                    "isStructure": true,
                    "canReinforce": true,
                    "loadCapacity": 0,
                    "weaponIds": {},
                    "maxGroove": 0,
                    "canBeCaptured": true,
                    "maxHealth": 100
                }
            },
            {
                "id": 2,
                "garrisonClassId": "garrison",
                "setHealth": null,
                "transportedBy": -1,
                "unitClassId": "hq",
                "loadedUnits": {},
                "damageTakenPercent": 100,
                "grooveId": "",
                "playerId": 1,
                "health": 100,
                "hadTurn": false,
                "inTransport": false,
                "state": {},
                "attackerId": -1,
                "pos": {
                    "facing": 0,
                    "x": 5,
                    "y": 1
                },
                "canBeAttacked": true,
                "grooveCharge": 0,
                "attackerUnitClass": "",
                "attackerPlayerId": -1,
                "killedByLosing": false,
                "recruits": {},
                "startPos": {
                    "facing": 0,
                    "x": 5,
                    "y": 1
                },
                "setGroove": null,
                "unitClass": {
                    "weapons": {},
                    "inAir": false,
                    "moveRange": 0,
                    "isCommander": false,
                    "tags": [
                        "structure"
                    ],
                    "cost": 3000,
                    "passiveMultiplier": 1.0,
                    "id": "hq",
                    "transportTags": {},
                    "isStructure": true,
                    "canReinforce": false,
                    "loadCapacity": 0,
                    "weaponIds": {},
                    "maxGroove": 0,
                    "canBeCaptured": false,
                    "maxHealth": 100
                }
            },
            {
                "id": 3,
                "garrisonClassId": "garrison",
                "setHealth": null,
                "transportedBy": -1,
                "unitClassId": "barracks",
                "loadedUnits": {},
                "damageTakenPercent": 100,
                "grooveId": "",
                "playerId": -1,
                "health": 100,
                "hadTurn": false,
                "inTransport": false,
                "state": {},
                "attackerId": -1,
                "pos": {
                    "facing": 0,
                    "x": 17,
                    "y": 6
                },
                "canBeAttacked": true,
                "grooveCharge": 0,
                "attackerUnitClass": "",
                "attackerPlayerId": -1,
                "killedByLosing": false,
                "recruits": [
                    "soldier",
                    "dog",
                    "spearman",
                    "wagon",
                    "mage",
                    "archer",
                    "knight",
                    "ballista",
                    "trebuchet",
                    "giant"
                ],
                "startPos": {
                    "facing": 0,
                    "x": 17,
                    "y": 6
                },
                "setGroove": null,
                "unitClass": {
                    "weapons": {},
                    "inAir": false,
                    "moveRange": 0,
                    "isCommander": false,
                    "tags": [
                        "structure"
                    ],
                    "cost": 500,
                    "passiveMultiplier": 1.0,
                    "id": "barracks",
                    "transportTags": {},
                    "isStructure": true,
                    "canReinforce": true,
                    "loadCapacity": 0,
                    "weaponIds": {},
                    "maxGroove": 0,
                    "canBeCaptured": true,
                    "maxHealth": 100
                }
            },
            {
                "id": 4,
                "garrisonClassId": "garrison",
                "setHealth": null,
                "transportedBy": -1,
                "unitClassId": "barracks",
                "loadedUnits": {},
                "damageTakenPercent": 100,
                "grooveId": "",
                "playerId": 1,
                "health": 100,
                "hadTurn": false,
                "inTransport": false,
                "state": {},
                "attackerId": -1,
                "pos": {
                    "facing": 0,
                    "x": 12,
                    "y": 2
                },
                "canBeAttacked": true,
                "grooveCharge": 0,
                "attackerUnitClass": "",
                "attackerPlayerId": -1,
                "killedByLosing": false,
                "recruits": [
                    "soldier",
                    "dog",
                    "spearman",
                    "wagon",
                    "mage",
                    "archer",
                    "knight",
                    "ballista",
                    "trebuchet",
                    "giant"
                ],
                "startPos": {
                    "facing": 0,
                    "x": 12,
                    "y": 2
                },
                "setGroove": null,
                "unitClass": {
                    "weapons": {},
                    "inAir": false,
                    "moveRange": 0,
                    "isCommander": false,
                    "tags": [
                        "structure"
                    ],
                    "cost": 500,
                    "passiveMultiplier": 1.0,
                    "id": "barracks",
                    "transportTags": {},
                    "isStructure": true,
                    "canReinforce": true,
                    "loadCapacity": 0,
                    "weaponIds": {},
                    "maxGroove": 0,
                    "canBeCaptured": true,
                    "maxHealth": 100
                }
            },
            {
                "id": 5,
                "garrisonClassId": "garrison",
                "setHealth": null,
                "transportedBy": -1,
                "unitClassId": "city",
                "loadedUnits": {},
                "damageTakenPercent": 100,
                "grooveId": "",
                "playerId": 1,
                "health": 100,
                "hadTurn": false,
                "inTransport": false,
                "state": {},
                "attackerId": -1,
                "pos": {
                    "facing": 0,
                    "x": 7,
                    "y": 2
                },
                "canBeAttacked": true,
                "grooveCharge": 0,
                "attackerUnitClass": "",
                "attackerPlayerId": -1,
                "killedByLosing": false,
                "recruits": {},
                "startPos": {
                    "facing": 0,
                    "x": 7,
                    "y": 2
                },
                "setGroove": null,
                "unitClass": {
                    "weapons": {},
                    "inAir": false,
                    "moveRange": 0,
                    "isCommander": false,
                    "tags": [
                        "structure"
                    ],
                    "cost": 500,
                    "passiveMultiplier": 1.0,
                    "id": "city",
                    "transportTags": {},
                    "isStructure": true,
                    "canReinforce": true,
                    "loadCapacity": 0,
                    "weaponIds": {},
                    "maxGroove": 0,
                    "canBeCaptured": true,
                    "maxHealth": 100
                }
            },
            {
                "id": 6,
                "garrisonClassId": "garrison",
                "setHealth": null,
                "transportedBy": -1,
                "unitClassId": "hq",
                "loadedUnits": {},
                "damageTakenPercent": 100,
                "grooveId": "",
                "playerId": 0,
                "health": 100,
                "hadTurn": false,
                "inTransport": false,
                "state": {},
                "attackerId": -1,
                "pos": {
                    "facing": 0,
                    "x": 13,
                    "y": 23
                },
                "canBeAttacked": true,
                "grooveCharge": 0,
                "attackerUnitClass": "",
                "attackerPlayerId": -1,
                "killedByLosing": false,
                "recruits": {},
                "startPos": {
                    "facing": 0,
                    "x": 13,
                    "y": 23
                },
                "setGroove": null,
                "unitClass": {
                    "weapons": {},
                    "inAir": false,
                    "moveRange": 0,
                    "isCommander": false,
                    "tags": [
                        "structure"
                    ],
                    "cost": 3000,
                    "passiveMultiplier": 1.0,
                    "id": "hq",
                    "transportTags": {},
                    "isStructure": true,
                    "canReinforce": false,
                    "loadCapacity": 0,
                    "weaponIds": {},
                    "maxGroove": 0,
                    "canBeCaptured": false,
                    "maxHealth": 100
                }
            },
            {
                "id": 7,
                "garrisonClassId": "garrison",
                "setHealth": null,
                "transportedBy": -1,
                "unitClassId": "city",
                "loadedUnits": {},
                "damageTakenPercent": 100,
                "grooveId": "",
                "playerId": 0,
                "health": 100,
                "hadTurn": false,
                "inTransport": false,
                "state": {},
                "attackerId": -1,
                "pos": {
                    "facing": 0,
                    "x": 11,
                    "y": 22
                },
                "canBeAttacked": true,
                "grooveCharge": 0,
                "attackerUnitClass": "",
                "attackerPlayerId": -1,
                "killedByLosing": false,
                "recruits": {},
                "startPos": {
                    "facing": 0,
                    "x": 11,
                    "y": 22
                },
                "setGroove": null,
                "unitClass": {
                    "weapons": {},
                    "inAir": false,
                    "moveRange": 0,
                    "isCommander": false,
                    "tags": [
                        "structure"
                    ],
                    "cost": 500,
                    "passiveMultiplier": 1.0,
                    "id": "city",
                    "transportTags": {},
                    "isStructure": true,
                    "canReinforce": true,
                    "loadCapacity": 0,
                    "weaponIds": {},
                    "maxGroove": 0,
                    "canBeCaptured": true,
                    "maxHealth": 100
                }
            },
            {
                "id": 8,
                "garrisonClassId": "garrison",
                "setHealth": null,
                "transportedBy": -1,
                "unitClassId": "city",
                "loadedUnits": {},
                "damageTakenPercent": 100,
                "grooveId": "",
                "playerId": 0,
                "health": 100,
                "hadTurn": false,
                "inTransport": false,
                "state": {},
                "attackerId": -1,
                "pos": {
                    "facing": 0,
                    "x": 15,
                    "y": 22
                },
                "canBeAttacked": true,
                "grooveCharge": 0,
                "attackerUnitClass": "",
                "attackerPlayerId": -1,
                "killedByLosing": false,
                "recruits": {},
                "startPos": {
                    "facing": 0,
                    "x": 15,
                    "y": 22
                },
                "setGroove": null,
                "unitClass": {
                    "weapons": {},
                    "inAir": false,
                    "moveRange": 0,
                    "isCommander": false,
                    "tags": [
                        "structure"
                    ],
                    "cost": 500,
                    "passiveMultiplier": 1.0,
                    "id": "city",
                    "transportTags": {},
                    "isStructure": true,
                    "canReinforce": true,
                    "loadCapacity": 0,
                    "weaponIds": {},
                    "maxGroove": 0,
                    "canBeCaptured": true,
                    "maxHealth": 100
                }
            },
            {
                "id": 9,
                "garrisonClassId": "garrison",
                "setHealth": null,
                "transportedBy": -1,
                "unitClassId": "barracks",
                "loadedUnits": {},
                "damageTakenPercent": 100,
                "grooveId": "",
                "playerId": 0,
                "health": 100,
                "hadTurn": false,
                "inTransport": false,
                "state": {},
                "attackerId": -1,
                "pos": {
                    "facing": 0,
                    "x": 6,
                    "y": 22
                },
                "canBeAttacked": true,
                "grooveCharge": 0,
                "attackerUnitClass": "",
                "attackerPlayerId": -1,
                "killedByLosing": false,
                "recruits": [
                    "soldier",
                    "dog",
                    "spearman",
                    "wagon",
                    "mage",
                    "archer",
                    "knight",
                    "ballista",
                    "trebuchet",
                    "giant"
                ],
                "startPos": {
                    "facing": 0,
                    "x": 6,
                    "y": 22
                },
                "setGroove": null,
                "unitClass": {
                    "weapons": {},
                    "inAir": false,
                    "moveRange": 0,
                    "isCommander": false,
                    "tags": [
                        "structure"
                    ],
                    "cost": 500,
                    "passiveMultiplier": 1.0,
                    "id": "barracks",
                    "transportTags": {},
                    "isStructure": true,
                    "canReinforce": true,
                    "loadCapacity": 0,
                    "weaponIds": {},
                    "maxGroove": 0,
                    "canBeCaptured": true,
                    "maxHealth": 100
                }
            },
            {
                "id": 10,
                "garrisonClassId": "garrison",
                "setHealth": null,
                "transportedBy": -1,
                "unitClassId": "barracks",
                "loadedUnits": {},
                "damageTakenPercent": 100,
                "grooveId": "",
                "playerId": -1,
                "health": 100,
                "hadTurn": false,
                "inTransport": false,
                "state": {},
                "attackerId": -1,
                "pos": {
                    "facing": 0,
                    "x": 1,
                    "y": 18
                },
                "canBeAttacked": true,
                "grooveCharge": 0,
                "attackerUnitClass": "",
                "attackerPlayerId": -1,
                "killedByLosing": false,
                "recruits": [
                    "soldier",
                    "dog",
                    "spearman",
                    "wagon",
                    "mage",
                    "archer",
                    "knight",
                    "ballista",
                    "trebuchet",
                    "giant"
                ],
                "startPos": {
                    "facing": 0,
                    "x": 1,
                    "y": 18
                },
                "setGroove": null,
                "unitClass": {
                    "weapons": {},
                    "inAir": false,
                    "moveRange": 0,
                    "isCommander": false,
                    "tags": [
                        "structure"
                    ],
                    "cost": 500,
                    "passiveMultiplier": 1.0,
                    "id": "barracks",
                    "transportTags": {},
                    "isStructure": true,
                    "canReinforce": true,
                    "loadCapacity": 0,
                    "weaponIds": {},
                    "maxGroove": 0,
                    "canBeCaptured": true,
                    "maxHealth": 100
                }
            },
            {
                "id": 11,
                "garrisonClassId": "",
                "setHealth": null,
                "transportedBy": -1,
                "unitClassId": "soldier",
                "loadedUnits": {},
                "damageTakenPercent": 100,
                "grooveId": "",
                "playerId": 0,
                "health": 100,
                "hadTurn": false,
                "inTransport": false,
                "state": {},
                "attackerId": -1,
                "pos": {
                    "facing": 3,
                    "x": 15,
                    "y": 20
                },
                "canBeAttacked": true,
                "grooveCharge": 0,
                "attackerUnitClass": "",
                "attackerPlayerId": -1,
                "killedByLosing": false,
                "recruits": {},
                "startPos": {
                    "facing": 3,
                    "x": 15,
                    "y": 20
                },
                "setGroove": null,
                "unitClass": {
                    "weapons": [
                        {
                            "id": "sword",
                            "directionality": "omni",
                            "maxRange": 1,
                            "minRange": 1,
                            "horizontalAndVerticalOnly": false,
                            "terrainExclusion": {},
                            "canMoveAndAttack": true,
                            "horizontalAndVerticalExtraWidth": 0
                        }
                    ],
                    "inAir": false,
                    "moveRange": 4,
                    "isCommander": false,
                    "tags": [
                        "soldier",
                        "type.ground.light"
                    ],
                    "cost": 100,
                    "passiveMultiplier": 1.5,
                    "id": "soldier",
                    "transportTags": {},
                    "isStructure": false,
                    "canReinforce": false,
                    "loadCapacity": 0,
                    "weaponIds": [
                        "sword"
                    ],
                    "maxGroove": 0,
                    "canBeCaptured": false,
                    "maxHealth": 100
                }
            },
            {
                "id": 12,
                "garrisonClassId": "",
                "setHealth": null,
                "transportedBy": -1,
                "unitClassId": "commander_mercia",
                "loadedUnits": {},
                "damageTakenPercent": 100,
                "grooveId": "heal_aura",
                "playerId": 0,
                "health": 100,
                "hadTurn": false,
                "inTransport": false,
                "state": {},
                "attackerId": -1,
                "pos": {
                    "facing": 3,
                    "x": 13,
                    "y": 20
                },
                "canBeAttacked": true,
                "grooveCharge": 0,
                "attackerUnitClass": "",
                "attackerPlayerId": -1,
                "killedByLosing": false,
                "recruits": {},
                "startPos": {
                    "facing": 3,
                    "x": 13,
                    "y": 20
                },
                "setGroove": null,
                "unitClass": {
                    "weapons": [
                        {
                            "id": "merciaSword",
                            "directionality": "omni",
                            "maxRange": 1,
                            "minRange": 1,
                            "horizontalAndVerticalOnly": false,
                            "terrainExclusion": {},
                            "canMoveAndAttack": true,
                            "horizontalAndVerticalExtraWidth": 0
                        }
                    ],
                    "inAir": false,
                    "moveRange": 4,
                    "isCommander": true,
                    "tags": [
                        "commander",
                        "type.ground.light"
                    ],
                    "cost": 500,
                    "passiveMultiplier": 1.0,
                    "id": "commander_mercia",
                    "transportTags": {},
                    "isStructure": false,
                    "canReinforce": false,
                    "loadCapacity": 0,
                    "weaponIds": [
                        "merciaSword"
                    ],
                    "maxGroove": 100,
                    "canBeCaptured": false,
                    "maxHealth": 100
                }
            },
            {
                "id": 13,
                "garrisonClassId": "",
                "setHealth": null,
                "transportedBy": -1,
                "unitClassId": "commander_valder",
                "loadedUnits": {},
                "damageTakenPercent": 100,
                "grooveId": "raise_dead",
                "playerId": 1,
                "health": 100,
                "hadTurn": false,
                "inTransport": false,
                "state": {},
                "attackerId": -1,
                "pos": {
                    "facing": 0,
                    "x": 5,
                    "y": 4
                },
                "canBeAttacked": true,
                "grooveCharge": 0,
                "attackerUnitClass": "",
                "attackerPlayerId": -1,
                "killedByLosing": false,
                "recruits": {},
                "startPos": {
                    "facing": 0,
                    "x": 5,
                    "y": 4
                },
                "setGroove": null,
                "unitClass": {
                    "weapons": [
                        {
                            "id": "valderSpell",
                            "directionality": "omni",
                            "maxRange": 1,
                            "minRange": 1,
                            "horizontalAndVerticalOnly": false,
                            "terrainExclusion": {},
                            "canMoveAndAttack": true,
                            "horizontalAndVerticalExtraWidth": 0
                        }
                    ],
                    "inAir": false,
                    "moveRange": 4,
                    "isCommander": true,
                    "tags": [
                        "commander",
                        "type.ground.light"
                    ],
                    "cost": 500,
                    "passiveMultiplier": 1.0,
                    "id": "commander_valder",
                    "transportTags": {},
                    "isStructure": false,
                    "canReinforce": false,
                    "loadCapacity": 0,
                    "weaponIds": [
                        "valderSpell"
                    ],
                    "maxGroove": 50,
                    "canBeCaptured": false,
                    "maxHealth": 100
                }
            },
            {
                "id": 14,
                "garrisonClassId": "",
                "setHealth": null,
                "transportedBy": -1,
                "unitClassId": "soldier",
                "loadedUnits": {},
                "damageTakenPercent": 100,
                "grooveId": "",
                "playerId": 1,
                "health": 100,
                "hadTurn": false,
                "inTransport": false,
                "state": {},
                "attackerId": -1,
                "pos": {
                    "facing": 0,
                    "x": 3,
                    "y": 4
                },
                "canBeAttacked": true,
                "grooveCharge": 0,
                "attackerUnitClass": "",
                "attackerPlayerId": -1,
                "killedByLosing": false,
                "recruits": {},
                "startPos": {
                    "facing": 0,
                    "x": 3,
                    "y": 4
                },
                "setGroove": null,
                "unitClass": {
                    "weapons": [
                        {
                            "id": "sword",
                            "directionality": "omni",
                            "maxRange": 1,
                            "minRange": 1,
                            "horizontalAndVerticalOnly": false,
                            "terrainExclusion": {},
                            "canMoveAndAttack": true,
                            "horizontalAndVerticalExtraWidth": 0
                        }
                    ],
                    "inAir": false,
                    "moveRange": 4,
                    "isCommander": false,
                    "tags": [
                        "soldier",
                        "type.ground.light"
                    ],
                    "cost": 100,
                    "passiveMultiplier": 1.5,
                    "id": "soldier",
                    "transportTags": {},
                    "isStructure": false,
                    "canReinforce": false,
                    "loadCapacity": 0,
                    "weaponIds": [
                        "sword"
                    ],
                    "maxGroove": 0,
                    "canBeCaptured": false,
                    "maxHealth": 100
                }
            },
            {
                "id": 15,
                "garrisonClassId": "",
                "setHealth": null,
                "transportedBy": -1,
                "unitClassId": "soldier",
                "loadedUnits": {},
                "damageTakenPercent": 100,
                "grooveId": "",
                "playerId": 1,
                "health": 100,
                "hadTurn": false,
                "inTransport": false,
                "state": {},
                "attackerId": -1,
                "pos": {
                    "facing": 0,
                    "x": 7,
                    "y": 4
                },
                "canBeAttacked": true,
                "grooveCharge": 0,
                "attackerUnitClass": "",
                "attackerPlayerId": -1,
                "killedByLosing": false,
                "recruits": {},
                "startPos": {
                    "facing": 0,
                    "x": 7,
                    "y": 4
                },
                "setGroove": null,
                "unitClass": {
                    "weapons": [
                        {
                            "id": "sword",
                            "directionality": "omni",
                            "maxRange": 1,
                            "minRange": 1,
                            "horizontalAndVerticalOnly": false,
                            "terrainExclusion": {},
                            "canMoveAndAttack": true,
                            "horizontalAndVerticalExtraWidth": 0
                        }
                    ],
                    "inAir": false,
                    "moveRange": 4,
                    "isCommander": false,
                    "tags": [
                        "soldier",
                        "type.ground.light"
                    ],
                    "cost": 100,
                    "passiveMultiplier": 1.5,
                    "id": "soldier",
                    "transportTags": {},
                    "isStructure": false,
                    "canReinforce": false,
                    "loadCapacity": 0,
                    "weaponIds": [
                        "sword"
                    ],
                    "maxGroove": 0,
                    "canBeCaptured": false,
                    "maxHealth": 100
                }
            },
            {
                "id": 16,
                "garrisonClassId": "",
                "setHealth": null,
                "transportedBy": -1,
                "unitClassId": "soldier",
                "loadedUnits": {},
                "damageTakenPercent": 100,
                "grooveId": "",
                "playerId": 1,
                "health": 100,
                "hadTurn": false,
                "inTransport": false,
                "state": {},
                "attackerId": -1,
                "pos": {
                    "facing": 0,
                    "x": 4,
                    "y": 3
                },
                "canBeAttacked": true,
                "grooveCharge": 0,
                "attackerUnitClass": "",
                "attackerPlayerId": -1,
                "killedByLosing": false,
                "recruits": {},
                "startPos": {
                    "facing": 0,
                    "x": 4,
                    "y": 3
                },
                "setGroove": null,
                "unitClass": {
                    "weapons": [
                        {
                            "id": "sword",
                            "directionality": "omni",
                            "maxRange": 1,
                            "minRange": 1,
                            "horizontalAndVerticalOnly": false,
                            "terrainExclusion": {},
                            "canMoveAndAttack": true,
                            "horizontalAndVerticalExtraWidth": 0
                        }
                    ],
                    "inAir": false,
                    "moveRange": 4,
                    "isCommander": false,
                    "tags": [
                        "soldier",
                        "type.ground.light"
                    ],
                    "cost": 100,
                    "passiveMultiplier": 1.5,
                    "id": "soldier",
                    "transportTags": {},
                    "isStructure": false,
                    "canReinforce": false,
                    "loadCapacity": 0,
                    "weaponIds": [
                        "sword"
                    ],
                    "maxGroove": 0,
                    "canBeCaptured": false,
                    "maxHealth": 100
                }
            },
            {
                "id": 17,
                "garrisonClassId": "garrison",
                "setHealth": null,
                "transportedBy": -1,
                "unitClassId": "city",
                "loadedUnits": {},
                "damageTakenPercent": 100,
                "grooveId": "",
                "playerId": -1,
                "health": 100,
                "hadTurn": false,
                "inTransport": false,
                "state": {},
                "attackerId": -1,
                "pos": {
                    "facing": 0,
                    "x": 5,
                    "y": 10
                },
                "canBeAttacked": true,
                "grooveCharge": 0,
                "attackerUnitClass": "",
                "attackerPlayerId": -1,
                "killedByLosing": false,
                "recruits": {},
                "startPos": {
                    "facing": 0,
                    "x": 5,
                    "y": 10
                },
                "setGroove": null,
                "unitClass": {
                    "weapons": {},
                    "inAir": false,
                    "moveRange": 0,
                    "isCommander": false,
                    "tags": [
                        "structure"
                    ],
                    "cost": 500,
                    "passiveMultiplier": 1.0,
                    "id": "city",
                    "transportTags": {},
                    "isStructure": true,
                    "canReinforce": true,
                    "loadCapacity": 0,
                    "weaponIds": {},
                    "maxGroove": 0,
                    "canBeCaptured": true,
                    "maxHealth": 100
                }
            },
            {
                "id": 18,
                "garrisonClassId": "garrison",
                "setHealth": null,
                "transportedBy": -1,
                "unitClassId": "city",
                "loadedUnits": {},
                "damageTakenPercent": 100,
                "grooveId": "",
                "playerId": -1,
                "health": 100,
                "hadTurn": false,
                "inTransport": false,
                "state": {},
                "attackerId": -1,
                "pos": {
                    "facing": 0,
                    "x": 9,
                    "y": 9
                },
                "canBeAttacked": true,
                "grooveCharge": 0,
                "attackerUnitClass": "",
                "attackerPlayerId": -1,
                "killedByLosing": false,
                "recruits": {},
                "startPos": {
                    "facing": 0,
                    "x": 9,
                    "y": 9
                },
                "setGroove": null,
                "unitClass": {
                    "weapons": {},
                    "inAir": false,
                    "moveRange": 0,
                    "isCommander": false,
                    "tags": [
                        "structure"
                    ],
                    "cost": 500,
                    "passiveMultiplier": 1.0,
                    "id": "city",
                    "transportTags": {},
                    "isStructure": true,
                    "canReinforce": true,
                    "loadCapacity": 0,
                    "weaponIds": {},
                    "maxGroove": 0,
                    "canBeCaptured": true,
                    "maxHealth": 100
                }
            },
            {
                "id": 19,
                "garrisonClassId": "garrison",
                "setHealth": null,
                "transportedBy": -1,
                "unitClassId": "city",
                "loadedUnits": {},
                "damageTakenPercent": 100,
                "grooveId": "",
                "playerId": -1,
                "health": 100,
                "hadTurn": false,
                "inTransport": false,
                "state": {},
                "attackerId": -1,
                "pos": {
                    "facing": 0,
                    "x": 9,
                    "y": 15
                },
                "canBeAttacked": true,
                "grooveCharge": 0,
                "attackerUnitClass": "",
                "attackerPlayerId": -1,
                "killedByLosing": false,
                "recruits": {},
                "startPos": {
                    "facing": 0,
                    "x": 9,
                    "y": 15
                },
                "setGroove": null,
                "unitClass": {
                    "weapons": {},
                    "inAir": false,
                    "moveRange": 0,
                    "isCommander": false,
                    "tags": [
                        "structure"
                    ],
                    "cost": 500,
                    "passiveMultiplier": 1.0,
                    "id": "city",
                    "transportTags": {},
                    "isStructure": true,
                    "canReinforce": true,
                    "loadCapacity": 0,
                    "weaponIds": {},
                    "maxGroove": 0,
                    "canBeCaptured": true,
                    "maxHealth": 100
                }
            },
            {
                "id": 20,
                "garrisonClassId": "garrison",
                "setHealth": null,
                "transportedBy": -1,
                "unitClassId": "city",
                "loadedUnits": {},
                "damageTakenPercent": 100,
                "grooveId": "",
                "playerId": -1,
                "health": 100,
                "hadTurn": false,
                "inTransport": false,
                "state": {},
                "attackerId": -1,
                "pos": {
                    "facing": 0,
                    "x": 13,
                    "y": 14
                },
                "canBeAttacked": true,
                "grooveCharge": 0,
                "attackerUnitClass": "",
                "attackerPlayerId": -1,
                "killedByLosing": false,
                "recruits": {},
                "startPos": {
                    "facing": 0,
                    "x": 13,
                    "y": 14
                },
                "setGroove": null,
                "unitClass": {
                    "weapons": {},
                    "inAir": false,
                    "moveRange": 0,
                    "isCommander": false,
                    "tags": [
                        "structure"
                    ],
                    "cost": 500,
                    "passiveMultiplier": 1.0,
                    "id": "city",
                    "transportTags": {},
                    "isStructure": true,
                    "canReinforce": true,
                    "loadCapacity": 0,
                    "weaponIds": {},
                    "maxGroove": 0,
                    "canBeCaptured": true,
                    "maxHealth": 100
                }
            },
            {
                "id": 21,
                "garrisonClassId": "",
                "setHealth": null,
                "transportedBy": -1,
                "unitClassId": "soldier",
                "loadedUnits": {},
                "damageTakenPercent": 100,
                "grooveId": "",
                "playerId": 0,
                "health": 100,
                "hadTurn": true,
                "inTransport": false,
                "state": {},
                "attackerId": -1,
                "pos": {
                    "facing": 0,
                    "x": 11,
                    "y": 17
                },
                "canBeAttacked": true,
                "grooveCharge": 0,
                "attackerUnitClass": "",
                "attackerPlayerId": -1,
                "killedByLosing": false,
                "recruits": {},
                "startPos": {
                    "facing": 0,
                    "x": 11,
                    "y": 17
                },
                "setGroove": null,
                "unitClass": {
                    "weapons": [
                        {
                            "id": "sword",
                            "directionality": "omni",
                            "maxRange": 1,
                            "minRange": 1,
                            "horizontalAndVerticalOnly": false,
                            "terrainExclusion": {},
                            "canMoveAndAttack": true,
                            "horizontalAndVerticalExtraWidth": 0
                        }
                    ],
                    "inAir": false,
                    "moveRange": 4,
                    "isCommander": false,
                    "tags": [
                        "soldier",
                        "type.ground.light"
                    ],
                    "cost": 100,
                    "passiveMultiplier": 1.5,
                    "id": "soldier",
                    "transportTags": {},
                    "isStructure": false,
                    "canReinforce": false,
                    "loadCapacity": 0,
                    "weaponIds": [
                        "sword"
                    ],
                    "maxGroove": 0,
                    "canBeCaptured": false,
                    "maxHealth": 100
                }
            },
            {
                "id": 22,
                "garrisonClassId": "",
                "setHealth": null,
                "transportedBy": -1,
                "unitClassId": "soldier",
                "loadedUnits": {},
                "damageTakenPercent": 100,
                "grooveId": "",
                "playerId": -1,
                "health": 100,
                "hadTurn": true,
                "inTransport": false,
                "state": [
                    {
                        "key": "MLOG_MatchId",
                        "value": "1184350847"
                    }
                ],
                "attackerId": -1,
                "pos": {
                    "facing": 1,
                    "x": -85,
                    "y": -64
                },
                "canBeAttacked": true,
                "grooveCharge": 0,
                "attackerUnitClass": "",
                "attackerPlayerId": -1,
                "killedByLosing": false,
                "recruits": {},
                "startPos": {
                    "facing": 1,
                    "x": -85,
                    "y": -64
                },
                "setGroove": null,
                "unitClass": {
                    "weapons": [
                        {
                            "id": "sword",
                            "directionality": "omni",
                            "maxRange": 1,
                            "minRange": 1,
                            "horizontalAndVerticalOnly": false,
                            "terrainExclusion": {},
                            "canMoveAndAttack": true,
                            "horizontalAndVerticalExtraWidth": 0
                        }
                    ],
                    "inAir": false,
                    "moveRange": 4,
                    "isCommander": false,
                    "tags": [
                        "soldier",
                        "type.ground.light"
                    ],
                    "cost": 100,
                    "passiveMultiplier": 1.5,
                    "id": "soldier",
                    "transportTags": {},
                    "isStructure": false,
                    "canReinforce": false,
                    "loadCapacity": 0,
                    "weaponIds": [
                        "sword"
                    ],
                    "maxGroove": 0,
                    "canBeCaptured": false,
                    "maxHealth": 100
                }
            }
        ],
        "playerId": 0,
        "id": 0
    },
    "deltas": [
        {
            "units": {
                "10": {
                    "hadTurn": [
                        false,
                        true
                    ],
                    "pos": {
                        "facing": [
                            3,
                            1
                        ],
                        "x": [
                            15,
                            16
                        ],
                        "y": [
                            20,
                            17
                        ]
                    },
                    "startPos": {
                        "facing": [
                            3,
                            1
                        ],
                        "x": [
                            15,
                            16
                        ],
                        "y": [
                            20,
                            17
                        ]
                    }
                },
                "_t": "a"
            },
            "id": [
                0,
                1
            ]
        },
        {
            "units": {
                "11": {
                    "hadTurn": [
                        false,
                        true
                    ],
                    "pos": {
                        "facing": [
                            3,
                            0
                        ],
                        "x": [
                            13,
                            15
                        ],
                        "y": [
                            20,
                            18
                        ]
                    },
                    "startPos": {
                        "facing": [
                            3,
                            0
                        ],
                        "x": [
                            13,
                            15
                        ],
                        "y": [
                            20,
                            18
                        ]
                    }
                },
                "_t": "a"
            },
            "id": [
                1,
                2
            ]
        }
    ]
}