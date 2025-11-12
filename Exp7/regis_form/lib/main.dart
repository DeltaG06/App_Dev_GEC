import 'package:flutter/material.dart';

void main() {
  runApp(const RegistrationApp());
}

class RegistrationApp extends StatelessWidget {
  const RegistrationApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false, // remove debug label
      title: 'Registration Form',
      theme: ThemeData(
        primarySwatch: Colors.lightGreen,
        inputDecorationTheme: const InputDecorationTheme(
          filled: true,
          fillColor: Color.fromARGB(255, 243, 243, 243),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.all(Radius.circular(10)),
            borderSide: BorderSide.none,
          ),
          contentPadding: EdgeInsets.symmetric(vertical: 15, horizontal: 20),
        ),
      ),
      home: const RegistrationForm(),
    );
  }
}

class RegistrationForm extends StatefulWidget {
  const RegistrationForm({super.key});

  @override
  State<RegistrationForm> createState() => _RegistrationFormState();
}

class _RegistrationFormState extends State<RegistrationForm>
    with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();

  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  String _gender = "Male";
  String? _selectedCountry;
  bool _termsAccepted = false;

  List<String> countries = ["USA", "India", "UK", "Canada", "Australia"];

  // Animation controller for floating decorations
  late final AnimationController _animController;
  late final Animation<double> _floatAnim;

  @override
  void initState() {
    super.initState();
    _animController =
        AnimationController(vsync: this, duration: const Duration(seconds: 4))
          ..repeat(reverse: true);
    _floatAnim = Tween<double>(begin: -6.0, end: 6.0).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _animController.dispose();
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _submitForm() {
    if (_formKey.currentState!.validate()) {
      if (!_termsAccepted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Please accept terms and conditions")),
        );
        return;
      }

      String name = _nameController.text;
      String email = _emailController.text;
      String gender = _gender;
      String country = _selectedCountry ?? "Not selected";

      showDialog(
        context: context,
        builder: (_) => AlertDialog(
          title: const Text("Registration Successful"),
          content: Text(
              "Name: $name\nEmail: $email\nGender: $gender\nCountry: $country"),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text("OK"),
            )
          ],
        ),
      );
    }
  }

  // A small widget for floating decorative flower/nerd icons
  Widget _floatingIcon(
      {required IconData icon,
      required double size,
      required double left,
      required double top,
      required double rotation,
      required Color color,
      bool mirror = false}) {
    return AnimatedBuilder(
      animation: _floatAnim,
      builder: (context, child) {
        // vertical bobbing using _floatAnim value
        final offsetY = _floatAnim.value;
        final rot = rotation + (_floatAnim.value / 60);
        return Positioned(
          left: left,
          top: top + offsetY,
          child: Transform.rotate(
            angle: mirror ? -rot : rot,
            child: Opacity(
              opacity: 0.9,
              child: Icon(
                icon,
                size: size,
                color: color.withOpacity(0.95),
              ),
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // main background gradient and radial spotlight
      body: Stack(
        children: [
          // Background gradient
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Color(0xFF6EE7B7), // mint
                  Color(0xFFB794F4), // lavender
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
          ),

          // Radial light
          Positioned.fill(
            child: IgnorePointer(
              child: Align(
                alignment: Alignment.topCenter,
                child: Container(
                  width: double.infinity,
                  height: 360,
                  decoration: BoxDecoration(
                    gradient: RadialGradient(
                      center: const Alignment(0, -0.5),
                      radius: 0.9,
                      colors: [
                        Colors.white.withOpacity(0.25),
                        Colors.transparent,
                      ],
                      stops: const [0.0, 1.0],
                    ),
                  ),
                ),
              ),
            ),
          ),

          // Floating decorative icons (flowers + nerd icons)
          // Positioned using helper _floatingIcon for animation
          _floatingIcon(
            icon: Icons.local_florist,
            size: 36,
            left: 22,
            top: 60,
            rotation: 0.12,
            color: Colors.pinkAccent,
          ),
          _floatingIcon(
            icon: Icons.computer,
            size: 34,
            left: 320,
            top: 90,
            rotation: -0.08,
            color: Colors.indigo,
            mirror: true,
          ),
          _floatingIcon(
            icon: Icons.code,
            size: 28,
            left: 50,
            top: 260,
            rotation: 0.18,
            color: Colors.deepPurple,
          ),
          _floatingIcon(
            icon: Icons.psychology, // a "brainy" icon
            size: 30,
            left: 280,
            top: 230,
            rotation: -0.14,
            color: Colors.orangeAccent,
          ),
          _floatingIcon(
            icon: Icons.local_florist,
            size: 28,
            left: 200,
            top: 40,
            rotation: 0.05,
            color: Colors.yellow.shade700,
            mirror: true,
          ),

          // Main content scrollable
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
              child: Column(
                children: [
                  // Top header with avatar + chips (flowers + nerdy badges)
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      // Circular avatar with flower + nerd glasses overlay
                      Stack(
                        alignment: Alignment.center,
                        children: [
                          Container(
                            width: 92,
                            height: 92,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              gradient: const LinearGradient(
                                colors: [
                                  Color(0xFFFFF4E6),
                                  Color(0xFFFCE7F3),
                                ],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              ),
                              boxShadow: [
                                BoxShadow(
                                    color: Colors.black.withOpacity(0.12),
                                    offset: const Offset(0, 6),
                                    blurRadius: 12),
                              ],
                            ),
                            child: const Center(
                              child: Icon(
                                Icons.local_florist,
                                size: 44,
                                color: Color(0xFFB91C1C),
                              ),
                            ),
                          ),

                          // tiny nerdy glasses overlay (text emoji) at bottom-right
                          Positioned(
                            right: -6,
                            bottom: -6,
                            child: Container(
                              padding: const EdgeInsets.all(6),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                shape: BoxShape.circle,
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.08),
                                    blurRadius: 6,
                                  )
                                ],
                              ),
                              child: const Icon(
                                Icons.remove_red_eye,
                                size: 18,
                                color: Colors.black87,
                              ),
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(width: 16),

                      // Title + chips
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Register',
                              style: TextStyle(
                                  fontSize: 28,
                                  fontWeight: FontWeight.w900,
                                  color: Colors.white),
                            ),
                            const SizedBox(height: 8),
                            Wrap(
                              spacing: 8,
                              runSpacing: 6,
                              children: [
                                Chip(
                                  avatar: const Icon(Icons.code, size: 18),
                                  label: const Text('Code Lover'),
                                  backgroundColor:
                                      Colors.white.withOpacity(0.9),
                                ),
                                Chip(
                                  avatar:
                                      const Icon(Icons.auto_fix_high, size: 18),
                                  label: const Text('UX Curious'),
                                  backgroundColor:
                                      Colors.white.withOpacity(0.9),
                                ),
                                Chip(
                                  avatar: const Icon(Icons.memory, size: 18),
                                  label: const Text('ML Beginner'),
                                  backgroundColor:
                                      Colors.white.withOpacity(0.9),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 22),

                  // Card with the form (slightly transparent to show background)
                  Card(
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                    ),
                    elevation: 8,
                    color: const Color.fromARGB(200, 255, 255, 255),
                    child: Padding(
                      padding: const EdgeInsets.all(18.0),
                      child: Form(
                        key: _formKey,
                        child: Column(
                          children: [
                            // Name
                            TextFormField(
                              controller: _nameController,
                              decoration: const InputDecoration(
                                labelText: "Name",
                                prefixIcon: Icon(Icons.person_outline),
                              ),
                              validator: (value) =>
                                  value!.isEmpty ? "Please enter your name" : null,
                            ),
                            const SizedBox(height: 14),

                            // Email
                            TextFormField(
                              controller: _emailController,
                              decoration: const InputDecoration(
                                labelText: "Email",
                                prefixIcon: Icon(Icons.email_outlined),
                              ),
                              keyboardType: TextInputType.emailAddress,
                              validator: (value) =>
                                  value!.isEmpty ? "Please enter your email" : null,
                            ),
                            const SizedBox(height: 14),

                            // Password
                            TextFormField(
                              controller: _passwordController,
                              decoration: const InputDecoration(
                                labelText: "Password",
                                prefixIcon: Icon(Icons.lock_outline),
                              ),
                              obscureText: true,
                              validator: (value) =>
                                  value!.isEmpty ? "Please enter password" : null,
                            ),
                            const SizedBox(height: 14),

                            // Gender row
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text("Gender:", style: TextStyle(fontSize: 16)),
                                Row(
                                  children: [
                                    Radio<String>(
                                      value: "Male",
                                      groupValue: _gender,
                                      onChanged: (value) {
                                        setState(() {
                                          _gender = value!;
                                        });
                                      },
                                    ),
                                    const Text("Male"),
                                    const SizedBox(width: 20),
                                    Radio<String>(
                                      value: "Female",
                                      groupValue: _gender,
                                      onChanged: (value) {
                                        setState(() {
                                          _gender = value!;
                                        });
                                      },
                                    ),
                                    const Text("Female"),
                                  ],
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),

                            // Country
                            DropdownButtonFormField<String>(
                              decoration: const InputDecoration(
                                labelText: "Select Country",
                                prefixIcon: Icon(Icons.flag_outlined),
                              ),
                              items: countries
                                  .map((country) => DropdownMenuItem(
                                      value: country, child: Text(country)))
                                  .toList(),
                              value: _selectedCountry,
                              onChanged: (value) {
                                setState(() {
                                  _selectedCountry = value;
                                });
                              },
                              validator: (value) =>
                                  value == null ? "Please select a country" : null,
                            ),
                            const SizedBox(height: 12),

                            // Terms + a tiny floral accent
                            Row(
                              children: [
                                Checkbox(
                                    value: _termsAccepted,
                                    onChanged: (value) {
                                      setState(() {
                                        _termsAccepted = value!;
                                      });
                                    }),
                                const Expanded(
                                    child: Text("I accept the terms and conditions")),
                                const SizedBox(width: 6),
                                const Icon(Icons.local_florist, color: Colors.pink),
                              ],
                            ),
                            const SizedBox(height: 14),

                            // Nerdy hint text
                            Container(
                              width: double.infinity,
                              padding: const EdgeInsets.symmetric(
                                  vertical: 10, horizontal: 14),
                              decoration: BoxDecoration(
                                color: Colors.grey.shade100,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Text.rich(
                                TextSpan(
                                  children: [
                                    TextSpan(
                                      text: 'Nerdy tip: ',
                                      style: TextStyle(fontWeight: FontWeight.bold),
                                    ),
                                    TextSpan(
                                      text:
                                          'Use a strong password, and add a fun bio later! 🧪✨',
                                    ),
                                  ],
                                ),
                              ),
                            ),

                            const SizedBox(height: 16),

                            // Submit
                            ElevatedButton(
                              onPressed: _submitForm,
                              child: const Text("Register"),
                              style: ElevatedButton.styleFrom(
                                minimumSize: const Size(double.infinity, 50),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(15),
                                ),
                                backgroundColor: const Color.fromARGB(255, 81, 58, 183),
                                textStyle: const TextStyle(fontSize: 18),
                                foregroundColor: Colors.white,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 18),

                  // Footer: tiny credits and a row of small nerdy flower icons
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: const [
                      Text('Made with '),
                      Icon(Icons.local_florist, size: 18, color: Colors.pink),
                      Text(' + '),
                      Icon(Icons.code, size: 18, color: Colors.deepPurple),
                      SizedBox(width: 8),
                      Text('by you'),
                    ],
                  ),
                  const SizedBox(height: 36),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
