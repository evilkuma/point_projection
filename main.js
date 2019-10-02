
(function() {

  THREE.Vector3.prototype.toFixed = function(a = 10) {
    this.x = +this.x.toFixed(a)
    this.y = +this.y.toFixed(a)
    this.z = +this.z.toFixed(a)
    return this
  }

  /**
   * ----------------------
   */

  function Mark(material) {
    this.constructor(new THREE.SphereGeometry(.2, 30), material)

    var outline = new THREE.Mesh(
      this.geometry,
      new THREE.MeshPhongMaterial( { color: 0xff0000, side: THREE.BackSide } )
    )
    outline.scale.multiplyScalar(1.2)
    outline.visible = false
    this.add(outline)

    this.mark = function(color) {
      outline.visible = !!color

      if(["string", "number"].includes(typeof color)) {
        outline.material.color.set(color)
      }
    }

  }
  Mark.prototype = Object.create(THREE.Mesh.prototype)

  function watchVec(v, events) {

    var props = {}

    for(let k of Object.keys(events)) {

      events[k] = events[k].bind(v)

      v['_'+k] = v[k]

      props[k] = {
        get() {
          return v['_'+k]
        },
        set(val) {
          v['_'+k] = val
          events[k]()
        }
      }

    }

    Object.defineProperties(v, props)

  }

  /**
   * ---------------------------
   */

  var three = new THREE.DefaultScene(document.body)

  var raycaster = new THREE.Raycaster
  var plane = new THREE.Plane(new THREE.Vector3(0, 1, 0))

  var obj = false
  var objs = []

  three.renderer.domElement.addEventListener('mousemove', function(e) {

    raycaster.setFromCamera( new THREE.Vector2(
      ( e.clientX / window.innerWidth ) * 2 - 1,
      - ( e.clientY / window.innerHeight ) * 2 + 1
    ), three.camera );

    if(obj) {

      obj.position.copy(raycaster.ray.intersectPlane(plane, new THREE.Vector3))

    } else {

      objs.forEach(o => o.mark(false))

      var info = raycaster.intersectObjects(objs)

      if(info[0]) info[0].object.mark('red')

    }

  }, false)

  three.renderer.domElement.addEventListener('mousedown', function(e) {

    objs.forEach(o => o.mark(false))

    var info = raycaster.intersectObjects(objs)

    if(info[0]) {

      info[0].object.mark('green')
      obj = info[0].object

    }

  }, false)

  three.renderer.domElement.addEventListener('mouseup', function(e) {

    if(obj) {
      obj.mark('red')
      obj = false
    }

  }, false)

  var arrow = new THREE.ArrowHelper
  var vec = new THREE.Vector3

  var sphs_material = new THREE.MeshPhongMaterial({color: 'green'})
  var lsphs = [new Mark(sphs_material), new Mark(sphs_material)]
  objs.push(...lsphs)
  var lpoints = lsphs.map(sph => sph.position)
  lpoints[0].x = -1; lpoints[1].x = 1

  var line = new THREE.Line(new THREE.Geometry, new THREE.LineBasicMaterial({color: 0x888888, linewidth: 4}))
  line.geometry.vertices.push( ...lpoints )

  lpoints.forEach(p => watchVec(p, {
    x() {
      line.geometry.verticesNeedUpdate = true
      calcArrowDir()
      calcProjPos()
    },
    y() {
      line.geometry.verticesNeedUpdate = true
      calcArrowDir()
      calcProjPos()
    },
    z() {
      line.geometry.verticesNeedUpdate = true
      calcArrowDir()
      calcProjPos()
    }
  }))

  var point = new Mark(sphs_material)
  objs.push(point)
  Object.defineProperty(arrow, 'position', { value: point.position })
  watchVec(point.position, {
    x() {
      calcProjPos()
    },
    y() {
      calcProjPos()
    },
    z() {
      calcProjPos()
    }
  })

  var proj = new Mark(new THREE.MeshPhongMaterial({color: 'blue'}))

  three.scene.add(line, ...lsphs, arrow, point, proj)

  function calcArrowDir() {

    vec.copy(lpoints[1].clone().sub(lpoints[0]).normalize().applyEuler(new THREE.Euler(0, Math.PI/2, 0)))
    arrow.setDirection(vec)

  }

  function calcProjPos() {

    var p1 = lpoints[0]
    var p2 = lpoints[1]
    var p3 = point.position
    var p4 = p3.clone().add(vec.clone().multiplyScalar(10))

    var pos = _Math.linesCrossPoint2(p1, p2, p3, p4, 'x', 'z')

    proj.position.copy(pos)

  }

})()
