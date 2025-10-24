import time
from django.core.cache import cache
from django.http import JsonResponse
import logging

logger = logging.getLogger(__name__)

class CommunicationRateLimitMiddleware:
    """Rate limiting middleware for communication API"""
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.rate_limits = {
            'send-message': {'limit': 100, 'window': 3600},  # 100 per hour
            'create-campaign': {'limit': 10, 'window': 3600},  # 10 per hour
            'bulk-send': {'limit': 5, 'window': 86400},  # 5 per day
        }
    
    def __call__(self, request):
        # Only apply to communication endpoints
        if '/communications/api/' in request.path:
            endpoint = self._get_endpoint_name(request.path, request.method)
            
            if endpoint in self.rate_limits:
                user_id = request.user.id if request.user.is_authenticated else 'anonymous'
                cache_key = f"rate_limit:{endpoint}:{user_id}"
                
                if not self._check_rate_limit(cache_key, self.rate_limits[endpoint]):
                    return JsonResponse({
                        'error': 'Rate limit exceeded',
                        'detail': f'Too many requests for {endpoint}'
                    }, status=429)
        
        response = self.get_response(request)
        return response
    
    def _get_endpoint_name(self, path, method):
        """Extract endpoint name from path and method"""
        # Extract the last part of the path as endpoint name
        path_parts = path.strip('/').split('/')
        if len(path_parts) >= 3:
            return f"{method.lower()}-{path_parts[-1]}"
        return 'unknown'
    
    def _check_rate_limit(self, cache_key, limit_config):
        """Check if request is within rate limits"""
        current = cache.get(cache_key, 0)
        
        if current >= limit_config['limit']:
            return False
        
        cache.incr(cache_key, 1)
        cache.expire(cache_key, limit_config['window'])
        return True

class CommunicationCacheMiddleware:
    """Caching middleware for communication data"""
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.cache_config = {
            'templates': 300,  # 5 minutes
            'channels': 600,   # 10 minutes
            'campaigns': 180,  # 3 minutes
        }
    
    def __call__(self, request):
        start_time = time.time()
        
        # Check cache for GET requests
        if request.method == 'GET' and '/communications/api/' in request.path:
            cache_key = self._generate_cache_key(request)
            cached_response = cache.get(cache_key)
            
            if cached_response:
                logger.debug(f"Cache hit for {request.path}")
                response = JsonResponse(cached_response['data'])
                response['X-Cache'] = 'HIT'
                response['X-Cache-Time'] = str(time.time() - start_time)
                return response
        
        response = self.get_response(request)
        
        # Cache successful GET responses
        if (request.method == 'GET' and 
            '/communications/api/' in request.path and 
            response.status_code == 200):
            self._cache_response(request, response)
            response['X-Cache'] = 'MISS'
        
        response['X-Response-Time'] = str(round(time.time() - start_time, 3))
        return response
    
    def _generate_cache_key(self, request):
        """Generate cache key from request"""
        path = request.path
        user_id = request.user.id if request.user.is_authenticated else 'anonymous'
        query_params = str(sorted(request.GET.items()))
        return f"comm_cache:{user_id}:{path}:{hash(query_params)}"
    
    def _cache_response(self, request, response):
        """Cache the response"""
        try:
            cache_key = self._generate_cache_key(request)
            endpoint = request.path.split('/')[-2]  # Get endpoint name
            
            cache_time = self.cache_config.get(endpoint, 300)  # Default 5 minutes
            
            # Only cache if we can parse the JSON response
            if hasattr(response, 'data'):
                cache.set(cache_key, {'data': response.data}, cache_time)
                logger.debug(f"Cached response for {request.path} for {cache_time}s")
                
        except Exception as e:
            logger.error(f"Error caching response: {str(e)}")
