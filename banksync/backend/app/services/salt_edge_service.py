import httpx
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from fastapi import HTTPException

from app.core.config import settings


class SaltEdgeService:
    def __init__(self):
        self.base_url = settings.SALT_EDGE_BASE_URL
        self.app_id = settings.SALT_EDGE_APP_ID
        self.secret = settings.SALT_EDGE_SECRET

    def _headers(self) -> Dict[str, str]:
        return {
            "App-id": self.app_id,
            "Secret": self.secret,
            "Content-Type": "application/json",
        }

    async def create_customer(self, identifier: str) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{self.base_url}/customers",
                headers=self._headers(),
                json={"data": {"identifier": identifier}},
                timeout=30,
            )
            if resp.status_code not in (200, 201):
                raise HTTPException(
                    status_code=502,
                    detail=f"Salt Edge: {resp.text}"
                )
            return resp.json().get("data", {})

    async def create_connect_session(
        self,
        customer_id: str,
        return_to: str,
        provider_code: Optional[str] = None,
    ) -> Dict[str, Any]:
        payload: Dict[str, Any] = {
            "data": {
                "customer_id": str(customer_id),
                "consent": {
                    "scopes": ["account_details", "transactions_details"],
                    "from_date": None,
                },
                "attempt": {
                    "return_to": return_to,
                    "fetch_scopes": ["accounts", "transactions"],
                },
            }
        }
        if provider_code:
            payload["data"]["provider_code"] = provider_code

        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{self.base_url}/connect_sessions/create",
                headers=self._headers(),
                json=payload,
                timeout=30,
            )
            if resp.status_code not in (200, 201):
                raise HTTPException(status_code=502, detail=f"Salt Edge: {resp.text}")
            return resp.json().get("data", {})

    async def get_connection(self, connection_id: str) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{self.base_url}/connections/{connection_id}",
                headers=self._headers(),
                timeout=30,
            )
            if resp.status_code == 404:
                raise HTTPException(status_code=404, detail="Ligação não encontrada")
            if resp.status_code != 200:
                raise HTTPException(status_code=502, detail=f"Salt Edge: {resp.text}")
            return resp.json().get("data", {})

    async def get_accounts(self, connection_id: str) -> List[Dict[str, Any]]:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{self.base_url}/accounts",
                headers=self._headers(),
                params={"connection_id": connection_id},
                timeout=30,
            )
            if resp.status_code != 200:
                raise HTTPException(status_code=502, detail=f"Salt Edge: {resp.text}")
            return resp.json().get("data", [])

    async def get_transactions(
        self,
        account_id: str,
        from_date: Optional[str] = None,
        to_date: Optional[str] = None,
        next_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        params: Dict[str, Any] = {"account_id": account_id}
        if from_date:
            params["from_date"] = from_date
        if to_date:
            params["to_date"] = to_date
        if next_id:
            params["next_id"] = next_id

        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{self.base_url}/transactions",
                headers=self._headers(),
                params=params,
                timeout=30,
            )
            if resp.status_code != 200:
                raise HTTPException(status_code=502, detail=f"Salt Edge: {resp.text}")
            return resp.json()

    async def get_providers(self, country_code: str = "PT") -> List[Dict[str, Any]]:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{self.base_url}/providers",
                headers=self._headers(),
                params={"country_code": country_code},
                timeout=30,
            )
            if resp.status_code != 200:
                raise HTTPException(status_code=502, detail=f"Salt Edge: {resp.text}")
            return resp.json().get("data", [])

    async def refresh_connection(self, connection_id: str) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            resp = await client.put(
                f"{self.base_url}/connections/{connection_id}/refresh",
                headers=self._headers(),
                timeout=30,
            )
            if resp.status_code != 200:
                raise HTTPException(status_code=502, detail=f"Salt Edge: {resp.text}")
            return resp.json().get("data", {})


salt_edge_service = SaltEdgeService()
