interface Point {
  x: number;
  z: number;
}

interface Room {
  id: string;
  room_type: string;
  area: number;
  height: number;
  width: number;
  floor_polygon: Point[];
  is_regular?: number;
}

interface FloorPlanData {
  room_count: number;
  total_area: number;
  room_types: string[];
  rooms: Room[];
}

// Scale factor - calculated from ratio of old to new coordinate ranges
const SCALE_FACTOR = 20; 

export const initialFloorPlanData: FloorPlanData = {
  "room_count": 8,
  "total_area": 70.95,
  "room_types": [
    "LivingRoom",
    "Kitchen",
    "Bathroom",
    "MasterRoom",
    "SecondRoom",
    "Balcony",
    "Balcony",
    "Balcony"
  ],
  "rooms": [
    {
      "area": 12.01,
      "floor_polygon": [
        {"x": 3.3 * SCALE_FACTOR, "z": 3.3 * SCALE_FACTOR},
        {"x": 3.3 * SCALE_FACTOR, "z": 6.6 * SCALE_FACTOR},
        {"x": 8.2 * SCALE_FACTOR, "z": 6.6 * SCALE_FACTOR},
        {"x": 8.2 * SCALE_FACTOR, "z": 5.5 * SCALE_FACTOR},
        {"x": 6.6 * SCALE_FACTOR, "z": 5.5 * SCALE_FACTOR},
        {"x": 6.6 * SCALE_FACTOR, "z": 3.3 * SCALE_FACTOR}
      ],
      "height": 3.3,
      "id": "room|2",
      "is_regular": 0,
      "room_type": "LivingRoom",
      "width": 4.9
    },
    {
      "area": 4.75,
      "floor_polygon": [
        {"x": 3.3 * SCALE_FACTOR, "z": 1.6 * SCALE_FACTOR},
        {"x": 3.3 * SCALE_FACTOR, "z": 3.3 * SCALE_FACTOR},
        {"x": 6.6 * SCALE_FACTOR, "z": 3.3 * SCALE_FACTOR},
        {"x": 6.6 * SCALE_FACTOR, "z": 1.6 * SCALE_FACTOR}
      ],
      "height": 1.6,
      "id": "room|3",
      "is_regular": 0,
      "room_type": "Kitchen",
      "width": 3.3
    },
    {
      "area": 3.32,
      "floor_polygon": [
        {"x": 0.0 * SCALE_FACTOR, "z": 5.5 * SCALE_FACTOR},
        {"x": 0.0 * SCALE_FACTOR, "z": 7.1 * SCALE_FACTOR},
        {"x": 1.6 * SCALE_FACTOR, "z": 7.1 * SCALE_FACTOR},
        {"x": 1.6 * SCALE_FACTOR, "z": 5.5 * SCALE_FACTOR}
      ],
      "height": 2.2,
      "id": "room|4",
      "is_regular": 0,
      "room_type": "Bathroom",
      "width": 1.6
    },
    {
      "area": 12.01,
      "floor_polygon": [
        {"x": 0.0 * SCALE_FACTOR, "z": 1.6 * SCALE_FACTOR},
        {"x": 0.0 * SCALE_FACTOR, "z": 3.3 * SCALE_FACTOR},
        {"x": 1.6 * SCALE_FACTOR, "z": 3.3 * SCALE_FACTOR},
        {"x": 1.6 * SCALE_FACTOR, "z": 4.9 * SCALE_FACTOR},
        {"x": 3.3 * SCALE_FACTOR, "z": 4.9 * SCALE_FACTOR},
        {"x": 3.3 * SCALE_FACTOR, "z": 1.6 * SCALE_FACTOR}
      ],
      "height": 3.3,
      "id": "room|5",
      "is_regular": 0,
      "room_type": "MasterRoom",
      "width": 3.3
    },
    {
      "area": 10.01,
      "floor_polygon": [
        {"x": 3.3 * SCALE_FACTOR, "z": 0.0 * SCALE_FACTOR},
        {"x": 3.3 * SCALE_FACTOR, "z": 1.6 * SCALE_FACTOR},
        {"x": 6.6 * SCALE_FACTOR, "z": 1.6 * SCALE_FACTOR},
        {"x": 6.6 * SCALE_FACTOR, "z": 0.0 * SCALE_FACTOR}
      ],
      "height": 1.6,
      "id": "room|6",
      "is_regular": 1,
      "room_type": "SecondRoom",
      "width": 3.3
    },
    {
      "area": 3.56,
      "floor_polygon": [
        {"x": 0.0 * SCALE_FACTOR, "z": 0.0 * SCALE_FACTOR},
        {"x": 0.0 * SCALE_FACTOR, "z": 1.6 * SCALE_FACTOR},
        {"x": 2.0 * SCALE_FACTOR, "z": 1.6 * SCALE_FACTOR},
        {"x": 2.0 * SCALE_FACTOR, "z": 0.0 * SCALE_FACTOR}
      ],
      "height": 1.6,
      "id": "room|7",
      "is_regular": 0,
      "room_type": "Balcony",
      "width": 2.0
    },
    {
      "area": 2.91,
      "floor_polygon": [
        {"x": 6.6 * SCALE_FACTOR, "z": 0.0 * SCALE_FACTOR},
        {"x": 6.6 * SCALE_FACTOR, "z": 1.6 * SCALE_FACTOR},
        {"x": 8.2 * SCALE_FACTOR, "z": 1.6 * SCALE_FACTOR},
        {"x": 8.2 * SCALE_FACTOR, "z": 0.0 * SCALE_FACTOR}
      ],
      "height": 1.6,
      "id": "room|8",
      "is_regular": 0,
      "room_type": "Balcony",
      "width": 1.6
    },
    {
      "area": 2.91,
      "floor_polygon": [
        {"x": 1.6 * SCALE_FACTOR, "z": 5.5 * SCALE_FACTOR},
        {"x": 1.6 * SCALE_FACTOR, "z": 7.1 * SCALE_FACTOR},
        {"x": 3.3 * SCALE_FACTOR, "z": 7.1 * SCALE_FACTOR},
        {"x": 3.3 * SCALE_FACTOR, "z": 5.5 * SCALE_FACTOR}
      ],
      "height": 1.6,
      "id": "room|9",
      "is_regular": 0,
      "room_type": "Balcony",
      "width": 1.7
    }
  ]
};