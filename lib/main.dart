import 'package:flutter/material.dart';

void main() {
  runApp(const NFamilyApp());
}

class NFamilyApp extends StatelessWidget {
  const NFamilyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'nFamily',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF6366F1),
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
      ),
      home: const Scaffold(
        body: Center(
          child: Text(
            'nFamily — coming soon',
            style: TextStyle(fontSize: 24),
          ),
        ),
      ),
    );
  }
}
