const API_URL = "https://crudcrud.com/api/fdb0bda89eaa40a692bbad2422cce317/usuarios";
const CHESS_API_URL = "https://lichess.org/api/user/";
let usuarioEditandoId = null;

$(".tab").click(function () {
  $(".tab").removeClass("active");
  $(this).addClass("active");

  $(".panel").removeClass("active");
  $($(this).data("target")).addClass("active");

  if ($(this).data("target") === "#lista") {
    cargarUsuarios();
  }
});

// Crear o actualizar
$("#guardar").click(function () {
  const usuario = {
    nombre: $("#nombre").val(),
    apellido: $("#apellido").val(),
    edad: $("#edad").val(),
    email: $("#email").val()
  };

  if (usuarioEditandoId) {
    // Modo actualización
    $.ajax({
      url: `${API_URL}/${usuarioEditandoId}`,
      method: "PUT",
      contentType: "application/json",
      data: JSON.stringify(usuario),
      success: function () {
        alert("Usuario actualizado");
        usuarioEditandoId = null;
        $("#guardar").text("Guardar");
        $("#nombre, #apellido, #edad, #email").val("");
        cargarUsuarios();
        $(".tab[data-target='#lista']").click(); 
      }
    });
  } else {
    // Modo creación
    $.ajax({
      url: API_URL,
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(usuario),
      success: function () {
        alert("Usuario registrado");
        $("#nombre, #apellido, #edad, #email").val("");
      }
    });
  }
});

// Leer usuarios
function cargarUsuarios() {
  $.ajax({
    url: API_URL,
    method: "GET",
    success: function (data) {
      $("#result").html("");
      data.forEach(function (u) {
        $("#result").append(`
          <div class="usuario">
            <strong>${u.nombre} ${u.apellido}</strong><br>
            Edad: ${u.edad}<br>
            Email: ${u.email}<br>
            <button onclick="editarUsuario('${u._id}', '${u.nombre}', '${u.apellido}', '${u.edad}', '${u.email}')">Editar</button>
            <button onclick="eliminarUsuario('${u._id}')">Eliminar</button>
          </div>
        `);
      });
    }
  });
}

// Editar
function editarUsuario(id, nombre, apellido, edad, email) {
  $("#nombre").val(nombre);
  $("#apellido").val(apellido);
  $("#edad").val(edad);
  $("#email").val(email);
  usuarioEditandoId = id;
  $("#guardar").text("Actualizar");
  $(".tab[data-target='#formulario']").click();
}

// Eliminar usuario
function eliminarUsuario(id) {
  $.ajax({
    url: API_URL + "/" + id,
    method: "DELETE",
    success: function () {
      alert("Usuario eliminado");
      cargarUsuarios();
    }
  });
}

// Búsqueda de usuarios de ajedrez
$("#buscar-btn").click(function () {
  const usuario = $("#buscar-termino").val().trim();
  
  if (!usuario) {
    alert("Por favor ingresa un nombre de usuario para buscar");
    return;
  }

  // Mostrar mensaje de carga
  $("#resultados-ajedrez").html(`
    <div class="loading">
      <p>Buscando usuario de ajedrez: <strong>${usuario}</strong>...</p>
    </div>
  `);

    $.ajax({
    url: CHESS_API_URL + encodeURIComponent(usuario), // Sin el parámetro ?input=
    method: "GET",
    success: function (data) {
      mostrarResultadoAjedrez(data, usuario);
    },
    error: function (xhr, status, error) {
      $("#resultados-ajedrez").html(`
        <div class="error">
          <h4>❌ Error en la búsqueda</h4>
          <p>No se pudo encontrar información del usuario: <strong>${usuario}</strong></p>
          <p>Verifica que el nombre de usuario sea correcto.</p>
        </div>
      `);
    }
  });
});

// REEMPLAZA SOLO ESTA FUNCIÓN EN TU CÓDIGO ORIGINAL
function mostrarResultadoAjedrez(data, usuario) {
  // Debug: mostrar en consola la respuesta completa
  console.log("=== DEBUG: Respuesta completa de la API ===");
  console.log(data);
  console.log("=== FIN DEBUG ===");
  
  if (!data || !data.id) {
    $("#resultados-ajedrez").html(`
      <div class="error">
        <h4>❌ Usuario no encontrado</h4>
        <p>No existe el usuario: <strong>${usuario}</strong></p>
        <p><strong>Debug - Respuesta de la API:</strong></p>
        <pre style="background: #f5f5f5; padding: 10px; border-radius: 5px; font-size: 12px; overflow-x: auto;">${JSON.stringify(data, null, 2)}</pre>
      </div>
    `);
    return;
  }

  const html = `
    <div class="chess-profile">
      <div class="profile-header">
        <h3>♟️ Perfil de Ajedrez</h3>
        <h4>${data.username || data.id}</h4>
        <a href="${data.url}" target="_blank" class="profile-link">Ver en Lichess</a>
      </div>

      <div class="profile-stats">
        <div class="stat-card">
          <h5>📊 Estadísticas Generales</h5>
          <p><strong>ID:</strong> ${data.id}</p>
          <p><strong>Creado:</strong> ${new Date(data.createdAt).toLocaleDateString()}</p>
          <p><strong>Última conexión:</strong> ${new Date(data.seenAt).toLocaleDateString()}</p>
          <p><strong>Tiempo total jugado:</strong> ${Math.round(data.playTime?.total / 3600)} horas</p>
        </div>

        <div class="stat-card">
          <h5>🎯 Record de Partidas</h5>
          <p><strong>Total:</strong> ${data.count?.all || 0}</p>
          <p><strong>Victorias:</strong> ${data.count?.win || 0}</p>
          <p><strong>Derrotas:</strong> ${data.count?.loss || 0}</p>
          <p><strong>Empates:</strong> ${data.count?.draw || 0}</p>
          <p><strong>Partidas rankeadas:</strong> ${data.count?.rated || 0}</p>
        </div>
      </div>

      <div class="ratings-section">
        <h5>⭐ Ratings por Modalidad</h5>
        <div class="ratings-grid">
          ${generarRatingCard("⚡ Bullet", data.perfs?.bullet)}
          ${generarRatingCard("🔥 Blitz", data.perfs?.blitz)}
          ${generarRatingCard("🏃 Rapid", data.perfs?.rapid)}
          ${generarRatingCard("🎭 Classical", data.perfs?.classical)}
          ${generarRatingCard("📮 Correspondence", data.perfs?.correspondence)}
          ${generarRatingCard("🧩 Puzzle", data.perfs?.puzzle)}
        </div>
      </div>
    </div>
  `;

  $("#resultados-ajedrez").html(html);
}

function generarRatingCard(modalidad, perfData) {
  if (!perfData) {
    return `
      <div class="rating-card">
        <h6>${modalidad}</h6>
        <p>Sin datos</p>
      </div>
    `;
  }

  const provisional = perfData.prov ? " (Provisional)" : "";
  
  return `
    <div class="rating-card">
      <h6>${modalidad}</h6>
      <p><strong>Rating:</strong> ${perfData.rating}${provisional}</p>
      <p><strong>Partidas:</strong> ${perfData.games || 0}</p>
      ${perfData.rd ? `<p><strong>RD:</strong> ${perfData.rd}</p>` : ''}
    </div>
  `;
}

// Permitir búsqueda con Enter
$("#buscar-termino").keypress(function(e) {
  if (e.which === 13) {
    $("#buscar-btn").click();
  }
});

document.addEventListener("deviceready", () => {
});