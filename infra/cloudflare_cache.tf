# Cloudflare Cache Rules
resource "cloudflare_ruleset" "cache_rules" {
  zone_id = data.cloudflare_zone.main.id
  name    = "Cache Rules"
  kind    = "zone"
  phase   = "http_request_cache_settings"

  # 1. Cache GET /api/ads/active
  rules {
    description = "Cache GET /api/ads/active"
    expression  = "(http.request.method == \"GET\" and http.request.uri.path == \"/api/ads/active\")"
    action      = "set_cache_settings"
    enabled     = true
    action_parameters {
      cache = true
      edge_ttl {
        mode    = "override_origin"
        default = 1800 # 30 minutes
      }
      browser_ttl {
        mode    = "override_origin"
        default = 1800 # 30 minutes
      }
      cache_key {
        ignore_query_strings_order = true
        cache_deception_armor      = true
      }
    }
  }

  # 2. Cache GET /
  rules {
    description = "Cache GET /"
    expression  = "(http.request.method == \"GET\" and http.request.uri.path == \"/\")"
    action      = "set_cache_settings"
    enabled     = true
    action_parameters {
      cache = true
      edge_ttl {
        mode    = "override_origin"
        default = 1800 # 30 minutes
      }
      browser_ttl {
        mode    = "override_origin"
        default = 1800 # 30 minutes
      }
      cache_key {
        ignore_query_strings_order = true
        cache_deception_armor      = true
      }
    }
  }

  # 3. Cache GET /docs for Portuguese content
  rules {
    description = "Cache GET /docs for Portuguese content"
    expression  = "(http.request.method == \"GET\" and http.request.uri.path == \"/docs\" and any(http.request.headers[\"accept-language\"][*] contains \"pt\"))"
    action      = "set_cache_settings"
    enabled     = true
    action_parameters {
      cache = true
      edge_ttl {
        mode    = "override_origin"
        default = 1800 # 30 minutes
      }
      browser_ttl {
        mode    = "override_origin"
        default = 1800 # 30 minutes
      }
      cache_key {
        ignore_query_strings_order = true
        cache_deception_armor      = true
      }
    }
  }

  # 4. Cache GET /docs for English content
  rules {
    description = "Cache GET /docs for English content"
    expression  = "(http.request.method == \"GET\" and http.request.uri.path == \"/docs\" and any(http.request.headers[\"accept-language\"][*] contains \"en\"))"
    action      = "set_cache_settings"
    enabled     = true
    action_parameters {
      cache = true
      edge_ttl {
        mode    = "override_origin"
        default = 1800 # 30 minutes
      }
      browser_ttl {
        mode    = "override_origin"
        default = 1800 # 30 minutes
      }
      cache_key {
        ignore_query_strings_order = true
        cache_deception_armor      = true
      }
    }
  }
}