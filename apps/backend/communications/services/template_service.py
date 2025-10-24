import re
from typing import Dict, Any
from django.template import Template, Context
from django.utils.html import strip_tags
from ..models import MessageTemplate

class TemplateService:
    """Service for managing and rendering message templates"""
    
    @staticmethod
    def extract_variables(content: str) -> list:
        """Extract template variables like {name} from content"""
        pattern = r'\{([^}]+)\}'
        return list(set(re.findall(pattern, content)))
    
    @staticmethod
    def render_template(template: MessageTemplate, context: Dict[str, Any]) -> Dict[str, str]:
        """Render template with provided context variables"""
        try:
            # Render subject
            subject_template = Template(template.subject)
            rendered_subject = subject_template.render(Context(context))
            
            # Render content
            content_template = Template(template.content)
            rendered_content = content_template.render(Context(context))
            
            # For SMS/WhatsApp, create plain text version
            plain_content = strip_tags(rendered_content) if template.channel.channel_type in ['sms', 'whatsapp'] else rendered_content
            
            return {
                'subject': rendered_subject,
                'content': rendered_content,
                'plain_content': plain_content,
                'variables_used': context
            }
        except Exception as e:
            raise ValueError(f"Template rendering failed: {str(e)}")
    
    @staticmethod
    def validate_template_variables(template: MessageTemplate, context: Dict[str, Any]) -> bool:
        """Validate that all required variables are provided"""
        required_vars = template.variables
        missing_vars = [var for var in required_vars if var not in context]
        
        if missing_vars:
            raise ValueError(f"Missing required variables: {', '.join(missing_vars)}")
        
        return True
    
    @classmethod
    def create_template(cls, data: Dict[str, Any], creator) -> MessageTemplate:
        """Create a new message template with variable extraction"""
        # Extract variables from content
        variables = cls.extract_variables(data.get('content', ''))
        if data.get('subject'):
            variables.extend(cls.extract_variables(data['subject']))
        
        # Remove duplicates
        variables = list(set(variables))
        
        template = MessageTemplate.objects.create(
            name=data['name'],
            template_type=data['template_type'],
            subject=data.get('subject', ''),
            content=data['content'],
            variables=variables,
            channel_id=data['channel_id'],
            created_by=creator
        )
        
        return template
