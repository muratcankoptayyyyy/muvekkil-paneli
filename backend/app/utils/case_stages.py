from typing import List, Dict, Any

def get_default_stages(case_type: str) -> List[Dict[str, Any]]:
    common_stages = [
        {
            "id": "filing",
            "title": "Dava Açılışı",
            "status": "completed",
            "order": 1
        },
        {
            "id": "preliminary",
            "title": "Ön İnceleme",
            "status": "current",
            "order": 2
        },
        {
            "id": "hearing",
            "title": "Tahkikat (Duruşmalar)",
            "status": "pending",
            "order": 3
        },
        {
            "id": "decision",
            "title": "Karar",
            "status": "pending",
            "order": 4
        },
        {
            "id": "appeal",
            "title": "İstinaf/Yargıtay",
            "status": "pending",
            "order": 5
        }
    ]

    criminal_stages = [
        {
            "id": "investigation",
            "title": "Soruşturma",
            "status": "completed",
            "order": 1
        },
        {
            "id": "indictment",
            "title": "İddianame",
            "status": "current",
            "order": 2
        },
        {
            "id": "prosecution",
            "title": "Kovuşturma",
            "status": "pending",
            "order": 3
        },
        {
            "id": "decision",
            "title": "Karar",
            "status": "pending",
            "order": 4
        },
        {
            "id": "appeal",
            "title": "İstinaf/Yargıtay",
            "status": "pending",
            "order": 5
        }
    ]

    if case_type == "criminal":
        return criminal_stages
    
    # Default to civil/common structure for others for now
    return common_stages
