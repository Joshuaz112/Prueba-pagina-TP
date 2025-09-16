(function(){
  const $ = (sel) => document.querySelector(sel);

  function normalizaRut(r){ 
    if(!r) return "";
    return r.toString().trim().replace(/\./g,"").replace(/-/g,"").toUpperCase();
  }

  // Esperar a que el DOM esté listo
  document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, starting profile script');
    
    // Obtiene ?rut= de la URL
    const urlParams = new URLSearchParams(location.search);
    const rutParam = normalizaRut(urlParams.get("rut"));
    
    console.log('RUT parameter from URL:', rutParam);

    if (!rutParam) {
      console.log('No RUT parameter found');
      $("#perfil").style.display = "block";
      $("#alerta-no-encontrado").style.display = "block";
      $(".perfil-card").style.display = "none";
      return;
    }

    // Importar datos de students.js
    import('../students.js').then(module => {
      console.log('Students module loaded:', module);
      const { listStudents } = module;
      
      // Obtener todos los estudiantes (activos y graduados)
      const allStudents = listStudents() || [];
      console.log('All students:', allStudents);
      
      // Buscar por RUT normalizado
      const alumno = allStudents.find(a => normalizaRut(a.run) === rutParam);
      console.log('Found student:', alumno);

      if(!alumno){
        console.log('Student not found');
        $("#perfil").style.display = "block";
        $("#alerta-no-encontrado").style.display = "block";
        $(".perfil-card").style.display = "none";
        return;
      }

      // Determinar estado del alumno
      const estado = (alumno.egreso || alumno.graduado) ? "Egresado" : "Alumno regular";

      // Completar cabecera
      $("#alumno-nombre").textContent = alumno.nombre || "Alumno";
      $("#alumno-nombre-txt").textContent = alumno.nombre || "No disponible";
      $("#alumno-rut").textContent = alumno.run || "No disponible";
      $("#alumno-curso").textContent = alumno.curso || "No disponible";
      $("#alumno-estado").textContent = estado;

      // Foto (fallback a placeholder)
      const placeholder = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180"><circle cx="90" cy="90" r="90" fill="%23e2e8f0"/><text x="90" y="100" text-anchor="middle" fill="%2364748b" font-family="Arial" font-size="16">Sin foto</text></svg>';
      const foto = (alumno.avatarUrl && alumno.avatarUrl.trim()) ? alumno.avatarUrl : placeholder;
      $("#alumno-foto").src = foto;
      $("#alumno-foto").alt = `Foto de ${alumno.nombre || 'alumno'}`;

      // RNPI sólo si egresado
      if(estado === "Egresado" && alumno.rnpi && alumno.rnpi.numero){
        $("#alumno-rnpi").textContent = alumno.rnpi.numero;
        $("#rnpi-row").style.display = "flex";
      } else {
        $("#rnpi-row").style.display = "none";
      }

      // Mostrar la tarjeta
      $("#perfil").style.display = "block";
      $(".perfil-card").style.display = "grid";
      $("#alerta-no-encontrado").style.display = "none";

    }).catch(error => {
      console.error('Error loading students data:', error);
      $("#perfil").style.display = "block";
      $("#alerta-no-encontrado").style.display = "block";
      $(".perfil-card").style.display = "none";
    });
  });

})();
