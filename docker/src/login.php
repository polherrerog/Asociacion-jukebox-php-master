<?php
require_once __DIR__ . '/lib/sesion.php';

$mensaje = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $usuario = trim($_POST['usuario'] ?? '');
    $password = $_POST['password'] ?? '';

    if ($usuario === '' || $password === '') {
        $mensaje = 'Introduce usuario y contraseña.';
    } else {
        $_SESSION['usuario'] = $usuario;
        $_SESSION['login'] = true;
        header('Location: home.php');
        exit;
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Iniciar Sesión - Jukebox</title>
    <style>
        body {
            font-family: Arial, Helvetica, sans-serif;
            background-color: #f7f7f7;
            padding: 40px 20px;
            color: #333;
        }

        .login-box {
            background-color: #fff;
            border: 1px solid #ccc;
            padding: 20px;
            max-width: 340px;
            margin: 0 auto;
        }

        h1 {
            font-size: 1.3rem;
            margin-top: 0;
            margin-bottom: 15px;
        }

        .form-row {
            margin-bottom: 12px;
        }

        label {
            display: block;
            margin-bottom: 4px;
            font-size: 0.9rem;
            font-weight: bold;
        }

        input[type="text"], input[type="password"] {
            width: 100%;
            padding: 6px;
            box-sizing: border-box;
            border: 1px solid #999;
        }

        button {
            padding: 7px 15px;
            cursor: pointer;
            background-color: #e9e9e9;
            border: 1px solid #777;
            font-size: 0.9rem;
        }

        button:hover {
            background-color: #dcdcdc;
        }

        .error {
            background-color: #fce8e6;
            border: 1px solid #ea4335;
            color: #c5221f;
            padding: 8px;
            margin-bottom: 12px;
            font-size: 0.85rem;
        }

        .note {
            font-size: 0.85rem;
            color: #666;
            margin-top: 15px;
            border-top: 1px solid #eee;
            padding-top: 10px;
        }
    </style>
</head>
<body>

<div class="login-box">
    <h1>Iniciar Sesión en Jukebox</h1>

    <?php if ($mensaje !== ''): ?>
        <div class="error"><?= htmlspecialchars($mensaje) ?></div>
    <?php endif; ?>

    <form method="post">
        <div class="form-row">
            <label for="usuario">Usuario:</label>
            <input type="text" id="usuario" name="usuario" value="admin" required>
        </div>
        <div class="form-row">
            <label for="password">Contraseña:</label>
            <input type="password" id="password" name="password" value="admin123" required>
        </div>
        <div>
            <button type="submit">Entrar</button>
        </div>
    </form>

    <div class="note">
        Cuenta de prueba: <strong>admin</strong> / <strong>admin123</strong>
    </div>
</div>

</body>
</html>
