import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../theme/brand_colors.dart';

/// nFamily auth screen — pre-alpha scaffold.
///
/// Placeholder screen during scaffolding phase. SDK integration deferred to P-FAM-4+.
/// Full authentication flow with NselfAuthClient will be implemented during development phase.
///
/// Status: scaffolding. Full family social features target v1.2.0.
class AuthScreen extends ConsumerStatefulWidget {
  const AuthScreen({super.key});

  @override
  ConsumerState<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends ConsumerState<AuthScreen> {
  final _serverController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _serverController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _signIn() async {
    if (_serverController.text.trim().isEmpty ||
        _emailController.text.trim().isEmpty ||
        _passwordController.text.isEmpty) {
      setState(() => _error = 'All fields are required.');
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      // TODO(P-FAM-4): integrate NselfAuthClient from nself_auth_sdk plugin bundle.
      // Placeholder: simulate auth flow during scaffolding phase.
      await Future.delayed(const Duration(milliseconds: 500));
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Auth SDK coming in v1.0.0 (P-FAM-4+)')),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _error = 'Sign-in failed. Check your server URL and credentials.');
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 48),
              // Brand header
              const Icon(
                Icons.family_restroom,
                size: 72,
                semanticLabel: 'nFamily logo',
                color: NselfBrandColors.primary,
              ),
              const SizedBox(height: 16),
              Text(
                'nFamily',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  color: NselfBrandColors.primary,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Pre-alpha — connect to your nSelf backend',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodySmall,
              ),
              const SizedBox(height: 48),

              // Server URL field
              Semantics(
                label: 'Server URL',
                child: TextField(
                  controller: _serverController,
                  decoration: const InputDecoration(
                    labelText: 'Server URL',
                    hintText: 'https://your-server.example.com',
                    prefixIcon: Icon(Icons.dns_outlined),
                    border: OutlineInputBorder(),
                  ),
                  keyboardType: TextInputType.url,
                  autocorrect: false,
                ),
              ),
              const SizedBox(height: 16),

              // Email field
              Semantics(
                label: 'Email address',
                child: TextField(
                  controller: _emailController,
                  decoration: const InputDecoration(
                    labelText: 'Email',
                    prefixIcon: Icon(Icons.email_outlined),
                    border: OutlineInputBorder(),
                  ),
                  keyboardType: TextInputType.emailAddress,
                  autocorrect: false,
                ),
              ),
              const SizedBox(height: 16),

              // Password field
              Semantics(
                label: 'Password',
                child: TextField(
                  controller: _passwordController,
                  decoration: const InputDecoration(
                    labelText: 'Password',
                    prefixIcon: Icon(Icons.lock_outlined),
                    border: OutlineInputBorder(),
                  ),
                  obscureText: true,
                ),
              ),
              const SizedBox(height: 8),

              if (_error != null)
                Padding(
                  padding: const EdgeInsets.only(top: 8, bottom: 4),
                  child: Text(
                    _error!,
                    style: TextStyle(color: Theme.of(context).colorScheme.error),
                    semanticsLabel: 'Error: $_error',
                  ),
                ),

              const SizedBox(height: 24),

              // Sign in button
              Semantics(
                button: true,
                label: 'Sign in',
                child: FilledButton(
                  onPressed: _loading ? null : _signIn,
                  child: _loading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Text('Sign In'),
                ),
              ),

              const SizedBox(height: 48),

              // Pre-alpha notice
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: NselfBrandColors.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: NselfBrandColors.primary.withValues(alpha: 0.3),
                  ),
                ),
                child: const Text(
                  'nFamily is in pre-alpha. Requires an nSelf backend with the '
                  'nFamily plugin bundle ($0.99/mo or included in ɳSelf+).',
                  style: TextStyle(fontSize: 12),
                  textAlign: TextAlign.center,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
