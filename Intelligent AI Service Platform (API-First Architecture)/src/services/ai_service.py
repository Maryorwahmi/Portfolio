"""
AI Service Layer - OpenAI Integration
Crafted by CaptainCode
"""
import logging
from typing import Optional, List, Dict, Any
from openai import OpenAI
from src.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class AIService:
    """Service for AI interactions with OpenAI"""
    
    def __init__(self):
        """Initialize OpenAI client"""
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL
    
    async def generate_response(
        self,
        message: str,
        system_prompt: Optional[str] = None,
        history: Optional[List[Dict[str, str]]] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000,
    ) -> Dict[str, Any]:
        """
        Generate AI response using OpenAI API
        
        Args:
            message: User message
            system_prompt: System prompt for context
            history: Chat history
            temperature: Response creativity (0-2)
            max_tokens: Maximum response length
            
        Returns:
            Dict with response text and metadata
        """
        try:
            # Build messages list
            messages = []
            
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            
            if history:
                messages.extend(history)
            
            messages.append({"role": "user", "content": message})
            
            # Call OpenAI API
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                top_p=0.9,
            )
            
            # Extract response
            assistant_message = response.choices[0].message.content
            
            return {
                "response": assistant_message,
                "confidence": 0.95,  # Could be enhanced with response metrics
                "usage": {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens,
                },
                "model": self.model,
            }
        
        except Exception as e:
            logger.error(f"Error generating AI response: {str(e)}")
            raise
    
    async def extract_structured_data(
        self,
        message: str,
        structure: str,
        system_prompt: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Extract structured data from message using OpenAI
        
        Args:
            message: Input message
            structure: Desired JSON structure description
            system_prompt: Optional system prompt
            
        Returns:
            Structured data as dict
        """
        try:
            full_system = system_prompt or ""
            full_system += f"\n\nExtract and return data in this JSON structure: {structure}"
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": full_system},
                    {"role": "user", "content": message},
                ],
                temperature=0.3,
                max_tokens=1000,
            )
            
            return {
                "data": response.choices[0].message.content,
                "tokens_used": response.usage.total_tokens,
            }
        
        except Exception as e:
            logger.error(f"Error extracting structured data: {str(e)}")
            raise
    
    async def generate_embedding(self, text: str) -> List[float]:
        """
        Generate embedding for text (for vector search)
        
        Args:
            text: Text to embed
            
        Returns:
            Embedding vector
        """
        try:
            response = self.client.embeddings.create(
                input=text,
                model=settings.EMBEDDING_MODEL,
            )
            return response.data[0].embedding
        
        except Exception as e:
            logger.error(f"Error generating embedding: {str(e)}")
            raise


# Singleton instance
_ai_service: Optional[AIService] = None


def get_ai_service() -> AIService:
    """Get AI service instance"""
    global _ai_service
    if _ai_service is None:
        _ai_service = AIService()
    return _ai_service
