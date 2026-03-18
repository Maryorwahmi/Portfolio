"""
Vector Database Service for semantic search
Crafted by CaptainCode
"""
import logging
from typing import List, Dict, Any, Optional
import pinecone
from src.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class VectorDBService:
    """Service for vector database operations (Pinecone)"""
    
    def __init__(self):
        """Initialize Pinecone client"""
        pinecone.init(
            api_key=settings.PINECONE_API_KEY,
            environment=settings.PINECONE_ENVIRONMENT,
        )
        self.index = pinecone.Index(settings.PINECONE_INDEX_NAME)
    
    async def upsert_vector(
        self,
        vector_id: str,
        embedding: List[float],
        metadata: Optional[Dict[str, Any]] = None,
    ) -> bool:
        """
        Upsert vector to Pinecone
        
        Args:
            vector_id: Unique ID for the vector
            embedding: Vector embedding
            metadata: Associated metadata
            
        Returns:
            Success status
        """
        try:
            self.index.upsert(
                vectors=[(vector_id, embedding, metadata or {})]
            )
            logger.info(f"Upserted vector: {vector_id}")
            return True
        
        except Exception as e:
            logger.error(f"Error upserting vector: {str(e)}")
            raise
    
    async def query_vectors(
        self,
        embedding: List[float],
        top_k: int = 5,
        filter: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        """
        Query similar vectors
        
        Args:
            embedding: Query embedding
            top_k: Number of results to return
            filter: Metadata filter
            
        Returns:
            List of similar vectors with metadata
        """
        try:
            results = self.index.query(
                vector=embedding,
                top_k=top_k,
                include_metadata=True,
                filter=filter,
            )
            
            return [
                {
                    "id": match["id"],
                    "score": match["score"],
                    "metadata": match.get("metadata", {}),
                }
                for match in results["matches"]
            ]
        
        except Exception as e:
            logger.error(f"Error querying vectors: {str(e)}")
            raise
    
    async def delete_vector(self, vector_id: str) -> bool:
        """Delete vector by ID"""
        try:
            self.index.delete(ids=[vector_id])
            return True
        except Exception as e:
            logger.error(f"Error deleting vector: {str(e)}")
            raise
    
    async def get_vector_stats(self) -> Dict[str, Any]:
        """Get index statistics"""
        try:
            stats = self.index.describe_index_stats()
            return {
                "dimension": stats.dimension,
                "index_fullness": stats.index_fullness,
                "total_vector_count": stats.total_vector_count,
                "namespaces": stats.namespaces,
            }
        except Exception as e:
            logger.error(f"Error getting vector stats: {str(e)}")
            raise


# Singleton instance
_vector_db_service: Optional[VectorDBService] = None


def get_vector_db_service() -> VectorDBService:
    """Get vector database service instance"""
    global _vector_db_service
    if _vector_db_service is None:
        _vector_db_service = VectorDBService()
    return _vector_db_service
