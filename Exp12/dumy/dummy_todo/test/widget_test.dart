// test/widget_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:dummy_todo/main.dart';

void main() {
  testWidgets('adds todos when FAB is tapped', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const MyApp());
    await tester.pumpAndSettle();

    // Initially, the "No todos yet" text should be present.
    expect(find.byKey(const Key('empty_text')), findsOneWidget);
    expect(find.text('Todo 1'), findsNothing);

    // Tap the FAB to add Todo 1.
    final fab = find.byTooltip('Add');
    expect(fab, findsOneWidget);
    await tester.tap(fab);
    await tester.pumpAndSettle();

    // Now Todo 1 should be displayed and the empty text should be gone.
    expect(find.text('Todo 1'), findsOneWidget);
    expect(find.byKey(const Key('empty_text')), findsNothing);

    // Tap again to add Todo 2.
    await tester.tap(fab);
    await tester.pumpAndSettle();

    expect(find.text('Todo 2'), findsOneWidget);
    expect(find.text('Todo 1'), findsOneWidget);
  });
}
