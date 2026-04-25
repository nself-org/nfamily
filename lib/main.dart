import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import 'theme/brand_colors.dart';
import 'screens/auth_screen.dart';

void main() {
  runApp(const ProviderScope(child: NFamilyApp()));
}

/// nFamily app — pre-alpha scaffold (v0.1.0).
///
/// Status: pre-alpha. Full family social + genealogy build targets v1.2.0.
/// This scaffold wires auth, routing, and sky-500 brand theme.
class NFamilyApp extends StatelessWidget {
  const NFamilyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'nFamily',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: NselfBrandColors.primary,
          brightness: Brightness.dark,
        ),
        scaffoldBackgroundColor: NselfBrandColors.background,
        useMaterial3: true,
      ),
      darkTheme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: NselfBrandColors.primary,
          brightness: Brightness.dark,
        ),
        scaffoldBackgroundColor: NselfBrandColors.background,
        useMaterial3: true,
      ),
      themeMode: ThemeMode.dark,
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [Locale('en')],
      home: const AuthScreen(),
    );
  }
}
